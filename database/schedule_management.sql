-- ============================================
-- SISTEMA DE GERENCIAMENTO DE AGENDA
-- Tabelas e funções para templates semanais e bloqueios
-- ============================================

-- 1. TABELA DE TEMPLATES SEMANAIS
-- Armazena horários padrão por dia da semana para cada técnico
create table if not exists weekly_templates (
  id uuid default gen_random_uuid() primary key,
  tech_id text not null references users(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Domingo, 6=Sábado
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Validações
  constraint valid_time_range check (end_time > start_time),
  constraint unique_day_per_tech unique(tech_id, day_of_week)
);

-- 2. TABELA DE BLOQUEIOS DE DIAS
-- Permite técnicos marcarem dias inteiros como indisponíveis
create table if not exists day_blocks (
  id uuid default gen_random_uuid() primary key,
  tech_id text not null references users(id) on delete cascade,
  block_date date not null,
  reason text,
  created_at timestamp with time zone default now(),
  
  -- Validações
  constraint no_past_blocks check (block_date >= current_date),
  constraint unique_block_per_day unique(tech_id, block_date)
);

-- 3. ÍNDICES PARA PERFORMANCE
create index if not exists idx_weekly_templates_tech on weekly_templates(tech_id) where is_active = true;
create index if not exists idx_day_blocks_tech_date on day_blocks(tech_id, block_date);

-- 4. TRIGGERS PARA UPDATED_AT
create trigger update_weekly_templates_updated_at
  before update on weekly_templates
  for each row execute function update_updated_at_column();

-- 5. FUNÇÃO PARA GERAR HORÁRIOS A PARTIR DO TEMPLATE
-- Gera slots de 1 hora com base no template semanal
create or replace function generate_schedule_from_template(
  p_tech_id text,
  p_start_date date default current_date,
  p_days_ahead int default 30
)
returns int as $$
declare
  v_current_date date;
  v_end_date date;
  v_day_of_week int;
  v_template record;
  v_slot_time time;
  v_slots_created int := 0;
  v_is_blocked boolean;
begin
  v_end_date := p_start_date + p_days_ahead;
  v_current_date := p_start_date;
  
  -- Loop através dos dias
  while v_current_date <= v_end_date loop
    -- Obter dia da semana (0=Domingo, 6=Sábado)
    v_day_of_week := extract(dow from v_current_date);
    
    -- Verificar se o dia está bloqueado
    select exists(
      select 1 from day_blocks 
      where tech_id = p_tech_id 
      and block_date = v_current_date
    ) into v_is_blocked;
    
    -- Se não estiver bloqueado, buscar template para este dia
    if not v_is_blocked then
      select * into v_template
      from weekly_templates
      where tech_id = p_tech_id
        and day_of_week = v_day_of_week
        and is_active = true;
      
      -- Se existe template para este dia, gerar slots
      if found then
        v_slot_time := v_template.start_time;
        
        -- Gerar slots de 1 hora
        while v_slot_time < v_template.end_time loop
          -- Inserir slot se não existir
          insert into schedules (tech_id, date, slots)
          values (
            p_tech_id,
            v_current_date,
            jsonb_build_array(
              jsonb_build_object(
                'id', gen_random_uuid()::text,
                'time', v_slot_time::text,
                'isBooked', false,
                'isBlocked', false
              )
            )
          )
          on conflict (tech_id, date) do update
          set slots = schedules.slots || jsonb_build_array(
            jsonb_build_object(
              'id', gen_random_uuid()::text,
              'time', v_slot_time::text,
              'isBooked', false,
              'isBlocked', false
            )
          )
          where not exists (
            select 1
            from jsonb_array_elements(schedules.slots) as slot
            where slot->>'time' = v_slot_time::text
          );
          
          v_slots_created := v_slots_created + 1;
          v_slot_time := v_slot_time + interval '1 hour';
        end loop;
      end if;
    end if;
    
    v_current_date := v_current_date + 1;
  end loop;
  
  return v_slots_created;
end;
$$ language plpgsql;

-- 6. FUNÇÃO PARA OBTER DIAS BLOQUEADOS
create or replace function get_blocked_dates(
  p_tech_id text,
  p_start_date date default current_date,
  p_end_date date default current_date + 30
)
returns table(block_date date, reason text) as $$
begin
  return query
  select db.block_date, db.reason
  from day_blocks db
  where db.tech_id = p_tech_id
    and db.block_date between p_start_date and p_end_date
  order by db.block_date;
end;
$$ language plpgsql;

-- 7. FUNÇÃO PARA VALIDAR TEMPLATE
create or replace function validate_weekly_template(
  p_start_time time,
  p_end_time time
)
returns boolean as $$
declare
  v_duration interval;
begin
  -- Validar que end > start
  if p_end_time <= p_start_time then
    raise exception 'Horário de término deve ser após o horário de início';
  end if;
  
  -- Calcular duração
  v_duration := p_end_time - p_start_time;
  
  -- Mínimo 2 horas de trabalho
  if v_duration < interval '2 hours' then
    raise exception 'Período de trabalho deve ser de no mínimo 2 horas';
  end if;
  
  -- Máximo 12 horas por dia
  if v_duration > interval '12 hours' then
    raise exception 'Período de trabalho não pode exceder 12 horas por dia';
  end if;
  
  return true;
end;
$$ language plpgsql;

-- 8. PRESET: HORÁRIO COMERCIAL PADRÃO
-- Função helper para criar template comercial padrão (Segunda a Sexta, 8h-18h)
create or replace function create_default_commercial_template(p_tech_id text)
returns void as $$
declare
  v_day int;
begin
  -- Segunda a Sexta (1-5)
  for v_day in 1..5 loop
    insert into weekly_templates (tech_id, day_of_week, start_time, end_time)
    values (p_tech_id, v_day, '08:00'::time, '18:00'::time)
    on conflict (tech_id, day_of_week) do update
    set start_time = '08:00'::time,
        end_time = '18:00'::time,
        is_active = true,
        updated_at = now();
  end loop;
  
  -- Sábado meio período (opcional)
  insert into weekly_templates (tech_id, day_of_week, start_time, end_time)
  values (p_tech_id, 6, '08:00'::time, '12:00'::time)
  on conflict (tech_id, day_of_week) do update
  set start_time = '08:00'::time,
      end_time = '12:00'::time,
      is_active = false,  -- Desabilitado por padrão
      updated_at = now();
end;
$$ language plpgsql;

-- COMENTÁRIOS PARA O DBA
comment on table weekly_templates is 'Templates de horários semanais recorrentes para técnicos';
comment on table day_blocks is 'Bloqueios de dias inteiros (férias, folgas, feriados)';
comment on function generate_schedule_from_template is 'Gera horários nos próximos N dias baseado no template semanal';
comment on function create_default_commercial_template is 'Cria template comercial padrão (Seg-Sex 8h-18h, Sáb 8h-12h desabilitado)';
