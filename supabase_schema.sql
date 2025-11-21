-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (simulating the DbUser interface)
-- Note: In a production Supabase app, you should use the built-in 'auth.users' table.
-- For this migration, we are creating a public 'users' table to match the existing logic.
create table if not exists public.users (
  id text primary key, -- Using text to support existing IDs if needed, or UUID
  email text unique not null,
  name text not null,
  role text not null check (role in ('CLIENT', 'TECHNICIAN', 'ADMIN')),
  avatar_url text,
  password text, -- WARNING: Storing plain text passwords for demo compatibility. Use Auth in production.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Technicians extra data
create table if not exists public.technicians (
  user_id text primary key references public.users(id) on delete cascade,
  specialties text[],
  rating numeric default 0,
  distance text,
  price_estimate text,
  bio text,
  address text
);

-- Appointments
create table if not exists public.appointments (
  id text primary key,
  client_id text references public.users(id),
  tech_id text references public.users(id),
  client_name text, -- Denormalized for easier display
  tech_name text,   -- Denormalized for easier display
  date text not null,
  time text not null,
  device_model text,
  issue_description text,
  status text not null,
  created_at text
);

-- Reviews
create table if not exists public.reviews (
  id text primary key,
  client_id text references public.users(id),
  tech_id text references public.users(id),
  client_name text, -- Denormalized
  rating numeric not null,
  comment text,
  tags text[],
  reply_text text,
  reply_created_at text,
  created_at text,
  updated_at text
);

-- Schedules
create table if not exists public.schedules (
  id uuid primary key default uuid_generate_v4(),
  tech_id text references public.users(id),
  date text not null,
  slots jsonb not null, -- Storing the array of TimeSlot objects
  unique(tech_id, date)
);

-- RLS Policies (Optional but recommended - Open for now)
alter table public.users enable row level security;
create policy "Public users access" on public.users for all using (true);

alter table public.technicians enable row level security;
create policy "Public technicians access" on public.technicians for all using (true);

alter table public.appointments enable row level security;
create policy "Public appointments access" on public.appointments for all using (true);

alter table public.reviews enable row level security;
create policy "Public reviews access" on public.reviews for all using (true);

alter table public.schedules enable row level security;
create policy "Public schedules access" on public.schedules for all using (true);
