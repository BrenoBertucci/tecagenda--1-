-- RLS Policies Script
-- Run this in your Supabase SQL Editor to fix "RLS Disabled" and "Security Definer View" errors

-- =============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. DEFINE POLICIES
-- =============================================================================

-- --- USERS ---
-- Allow public read access to users (needed for listing technicians)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid()::text = id);

-- (Optional) Allow users to insert their own profile (if not handled by trigger)
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid()::text = id);


-- --- APPOINTMENTS ---
-- Users can see their own appointments (as client or tech)
CREATE POLICY "Users can view own appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid()::text = client_id OR auth.uid()::text = tech_id);

-- Clients can create appointments
CREATE POLICY "Clients can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid()::text = client_id);

-- Users can update their own appointments (Client cancels, Tech completes)
CREATE POLICY "Users can update own appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid()::text = client_id OR auth.uid()::text = tech_id);


-- --- SCHEDULES ---
-- Public can view schedules (to check availability)
CREATE POLICY "Schedules are viewable by everyone" 
ON public.schedules FOR SELECT 
USING (true);

-- Technicians can manage their own schedules
CREATE POLICY "Techs can manage own schedules" 
ON public.schedules FOR ALL 
USING (auth.uid()::text = tech_id);


-- --- REVIEWS ---
-- Public can view reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Clients can create reviews
CREATE POLICY "Clients can create reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid()::text = client_id);

-- Clients can edit their reviews, Techs can reply (update)
CREATE POLICY "Users can update related reviews" 
ON public.reviews FOR UPDATE 
USING (auth.uid()::text = client_id OR auth.uid()::text = tech_id);

-- Clients can delete their own reviews
CREATE POLICY "Clients can delete own reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid()::text = client_id);


-- --- WEEKLY TEMPLATES & DAY BLOCKS ---
-- Only the technician can view/manage their templates and blocks
CREATE POLICY "Techs manage own templates" 
ON public.weekly_templates FOR ALL 
USING (auth.uid()::text = tech_id);

CREATE POLICY "Techs manage own blocks" 
ON public.day_blocks FOR ALL 
USING (auth.uid()::text = tech_id);


-- --- SECURITY AUDIT LOG ---
-- Only admins can view logs (assuming we have an is_admin function or check role)
-- For now, let's restrict to service role or specific admin check if implemented.
-- If no admin check exists yet in SQL, we can default to:
CREATE POLICY "Admins view logs" 
ON public.security_audit_log FOR SELECT 
USING (auth.uid()::text IN (SELECT id FROM public.users WHERE role = 'ADMIN'));

-- Allow system/users to insert logs (if client-side logging is used)
CREATE POLICY "System can insert logs" 
ON public.security_audit_log FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');


-- =============================================================================
-- 3. FIX SECURITY DEFINER VIEWS
-- =============================================================================
-- The linter warns that SECURITY DEFINER views bypass RLS. 
-- We should recreate them as SECURITY INVOKER (default) so they respect the RLS policies above.

-- Fix appointment_details view
DROP VIEW IF EXISTS public.appointment_details;
CREATE OR REPLACE VIEW public.appointment_details
WITH (security_invoker = true)
AS
SELECT 
    a.id,
    a.date,
    a.time,
    a.status,
    a.device_model,
    a.issue_description,
    a.created_at,
    a.updated_at,
    a.client_id,
    c.name AS client_name,
    c.avatar_url AS client_avatar,
    a.tech_id,
    t.name AS tech_name,
    t.avatar_url AS tech_avatar,
    t.address AS tech_address
FROM appointments a
JOIN users c ON a.client_id = c.id
JOIN users t ON a.tech_id = t.id;

-- Fix technician_reviews view
DROP VIEW IF EXISTS public.technician_reviews;
CREATE OR REPLACE VIEW public.technician_reviews
WITH (security_invoker = true)
AS
SELECT 
    r.id,
    r.rating,
    r.comment,
    r.tags,
    r.created_at,
    r.reply_text,
    r.reply_at,
    r.client_id,
    c.name AS client_name,
    c.avatar_url AS client_avatar,
    r.tech_id
FROM reviews r
JOIN users c ON r.client_id = c.id;
