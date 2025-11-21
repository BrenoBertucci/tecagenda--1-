-- ============================================
-- MELHORIAS DE SEGURANÇA E PERFORMANCE
-- ============================================

-- 1. ADICIONAR COLUNAS DE CONTROLE (soft delete e auditoria)
alter table users add column if not exists deleted_at timestamp with time zone;
alter table users add column if not exists updated_at timestamp with time zone;
alter table users add column if not exists created_by uuid;

alter table appointments add column if not exists deleted_at timestamp with time zone;
alter table appointments add column if not exists updated_at timestamp with time zone;
alter table appointments add column if not exists created_by uuid;

alter table reviews add column if not exists deleted_at timestamp with time zone;
alter table reviews add column if not exists updated_at timestamp with time zone;
alter table reviews add column if not exists created_by uuid;

alter table schedules add column if not exists deleted_at timestamp with time zone;
alter table schedules add column if not exists updated_at timestamp with time zone;
alter table schedules add column if not exists created_by uuid;

-- 2. ADICIONAR CONSTRAINTS DE UNICIDADE E VALIDAÇÃO
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_email_unique') then
    alter table users add constraint users_email_unique unique (email);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'users_rating_check') then
    alter table users add constraint users_rating_check check (rating >= 0 and rating <= 5);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_rating_range') then
    alter table reviews add constraint reviews_rating_range check (rating >= 1 and rating <= 5);
  end if;
end $$;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE E CONSULTAS FREQUENTES
create index if not exists idx_users_role on users(role) where deleted_at is null;
create index if not exists idx_users_email on users(email) where deleted_at is null;
create index if not exists idx_appointments_client on appointments(client_id) where deleted_at is null;
create index if not exists idx_appointments_tech on appointments(tech_id) where deleted_at is null;
create index if not exists idx_appointments_status on appointments(status) where deleted_at is null;
create index if not exists idx_appointments_date on appointments(date, time) where deleted_at is null;
create index if not exists idx_reviews_tech on reviews(tech_id) where deleted_at is null;
create index if not exists idx_schedules_tech_date on schedules(tech_id, date) where deleted_at is null;

-- ============================================
-- FUNÇÕES DE SEGURANÇA HELPER (Definidas antes das políticas)
-- ============================================
create or replace function get_authenticated_user()
returns uuid as $$
begin
  return auth.uid();
end;
$$ language plpgsql security definer;

create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from users 
    where id = auth.uid()::text 
    and role = 'ADMIN' 
    and deleted_at is null
  );
end;
$$ language plpgsql security definer;

-- 4. FUNÇÃO PARA ATUALIZAR updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 5. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
drop trigger if exists update_users_updated_at on users;
create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

drop trigger if exists update_appointments_updated_at on appointments;
create trigger update_appointments_updated_at before update on appointments
  for each row execute function update_updated_at_column();

drop trigger if exists update_reviews_updated_at on reviews;
create trigger update_reviews_updated_at before update on reviews
  for each row execute function update_updated_at_column();

drop trigger if exists update_schedules_updated_at on schedules;
create trigger update_schedules_updated_at before update on schedules
  for each row execute function update_updated_at_column();

-- 6. TABELA DE LOG DE SEGURANÇA (auditoria de acessos)
create table if not exists security_audit_log (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
  user_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_audit_log_table_record on security_audit_log(table_name, record_id);
create index if not exists idx_audit_log_user on security_audit_log(user_id);

-- 7. FUNÇÃO DE AUDITORIA
create or replace function audit_trigger_function()
returns trigger as $$
begin
  insert into security_audit_log (table_name, record_id, action, old_values, new_values)
  values (
    tg_table_name::text,
    coalesce(new.id::text, old.id::text),
    tg_op::text,
    case when tg_op = 'UPDATE' or tg_op = 'DELETE' 
      then row_to_json(old) 
      else null 
    end,
    case when tg_op = 'UPDATE' or tg_op = 'INSERT' 
      then row_to_json(new) 
      else null 
    end
  );
  return new;
end;
$$ language plpgsql;

-- ============================================
-- TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE USUÁRIO
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, avatar_url)
  values (
    new.id::text,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'CLIENT'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to ensure idempotency
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. ADICIONAR TRIGGERS DE AUDITORIA (descomente para produção)
/*
create trigger audit_users after insert or update or delete on users
  for each row execute function audit_trigger_function();

create trigger audit_appointments after insert or update or delete on appointments
  for each row execute function audit_trigger_function();

create trigger audit_reviews after insert or update or delete on reviews
  for each row execute function audit_trigger_function();
*/

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS) - PRODUÇÃO
-- ============================================

-- REMOVER POLÍTICAS PÚBLICAS INSEGURAS
drop policy if exists "Public Access" on users;
drop policy if exists "Public Access" on appointments;
drop policy if exists "Public Access" on reviews;
drop policy if exists "Public Access" on schedules;

-- POLÍTICAS PARA USUÁRIOS AUTENTICADOS
-- Políticas para Users
drop policy if exists "Users can view active users" on users;
create policy "Users can view active users" on users
  for select using (deleted_at is null);

drop policy if exists "Users can update own profile" on users;
create policy "Users can update own profile" on users
  for update using (auth.uid()::text = id) with check (deleted_at is null);

drop policy if exists "Admins can manage all users" on users;
create policy "Admins can manage all users" on users
  for all using (is_admin());

-- Políticas para Appointments
drop policy if exists "Clients can view own appointments" on appointments;
create policy "Clients can view own appointments" on appointments
  for select using (auth.uid()::text = client_id and deleted_at is null);

drop policy if exists "Technicians can view own appointments" on appointments;
create policy "Technicians can view own appointments" on appointments
  for select using (auth.uid()::text = tech_id and deleted_at is null);

drop policy if exists "Clients can insert own appointments" on appointments;
create policy "Clients can insert own appointments" on appointments
  for insert with check (auth.uid()::text = client_id and deleted_at is null);

drop policy if exists "Users can update appointment status" on appointments;
create policy "Users can update appointment status" on appointments
  for update using (
    (auth.uid()::text = client_id or auth.uid()::text = tech_id) 
    and deleted_at is null
  );

-- Políticas para Reviews
drop policy if exists "Clients can review own appointments" on reviews;
create policy "Clients can review own appointments" on reviews
  for insert with check (auth.uid()::text = client_id and deleted_at is null);

drop policy if exists "All can view reviews" on reviews;
create policy "All can view reviews" on reviews
  for select using (deleted_at is null);

drop policy if exists "Technicians can reply to reviews" on reviews;
create policy "Technicians can reply to reviews" on reviews
  for update using (auth.uid()::text = tech_id and deleted_at is null);

-- Políticas para Schedules
drop policy if exists "Technicians can manage own schedule" on schedules;
create policy "Technicians can manage own schedule" on schedules
  for all using (auth.uid()::text = tech_id and deleted_at is null);

drop policy if exists "Clients can view technician schedules" on schedules;
create policy "Clients can view technician schedules" on schedules
  for select using (deleted_at is null);

-- ============================================
-- VIEW PARA CONSULTAS SEGURAS (desnormalização controlada)
-- ============================================
create or replace view appointment_details as
select 
  a.id,
  a.client_id,
  c.name as client_name,
  a.tech_id,
  t.name as tech_name,
  a.date,
  a.time,
  a.device_model,
  a.issue_description,
  a.status,
  a.created_at,
  a.updated_at
from appointments a
join users c on a.client_id = c.id and c.deleted_at is null
join users t on a.tech_id = t.id and t.deleted_at is null
where a.deleted_at is null;

create or replace view technician_reviews as
select 
  r.id,
  r.client_id,
  c.name as client_name,
  r.tech_id,
  t.name as tech_name,
  r.rating,
  r.comment,
  r.tags,
  r.reply_text,
  r.reply_at,
  r.created_at
from reviews r
join users c on r.client_id = c.id and c.deleted_at is null
join users t on r.tech_id = t.id and t.deleted_at is null
where r.deleted_at is null;

-- ============================================
-- EXEMPLO DE PROCEDURE PARA SOFT DELETE
-- ============================================
create or replace function soft_delete_record(table_name text, record_id text)
returns boolean as $$
begin
  execute format('update %I set deleted_at = now() where id = $1 and deleted_at is null', table_name)
  using record_id;
  return found;
end;
$$ language plpgsql security definer;
