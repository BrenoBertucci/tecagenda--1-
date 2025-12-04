-- =============================================================================
-- Database Performance & Linter Fixes
-- Run this script in the Supabase SQL Editor
-- =============================================================================

-- 1. FIX DUPLICATE INDEXES
-- =============================================================================
-- The 'users' table has duplicate indexes on email (one is a constraint).
-- We'll drop the constraint to keep only the simpler index 'users_email_key'.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_unique;

-- 2. FIX MULTIPLE PERMISSIVE POLICIES (schedules)
-- =============================================================================
-- "Techs can manage own schedules" (FOR ALL) overlaps with "Schedules are viewable by everyone" (FOR SELECT).
-- We will split the "manage" policy into INSERT/UPDATE/DELETE to avoid the overlap on SELECT.

DROP POLICY IF EXISTS "Techs can manage own schedules" ON public.schedules;

CREATE POLICY "Techs can insert own schedules"
ON public.schedules FOR INSERT
WITH CHECK ((select auth.uid())::text = tech_id);

CREATE POLICY "Techs can update own schedules"
ON public.schedules FOR UPDATE
USING ((select auth.uid())::text = tech_id);

CREATE POLICY "Techs can delete own schedules"
ON public.schedules FOR DELETE
USING ((select auth.uid())::text = tech_id);


-- 3. FIX RLS INITIALIZATION PLAN (Wrap auth.uid() in select)
-- =============================================================================
-- This prevents the auth function from being re-evaluated for every row.

-- --- USERS ---
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING ((select auth.uid())::text = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK ((select auth.uid())::text = id);

-- --- APPOINTMENTS ---
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments" 
ON public.appointments FOR SELECT 
USING ((select auth.uid())::text = client_id OR (select auth.uid())::text = tech_id);

DROP POLICY IF EXISTS "Clients can create appointments" ON public.appointments;
CREATE POLICY "Clients can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK ((select auth.uid())::text = client_id);

DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments" 
ON public.appointments FOR UPDATE 
USING ((select auth.uid())::text = client_id OR (select auth.uid())::text = tech_id);

-- --- REVIEWS ---
DROP POLICY IF EXISTS "Clients can create reviews" ON public.reviews;
CREATE POLICY "Clients can create reviews" 
ON public.reviews FOR INSERT 
WITH CHECK ((select auth.uid())::text = client_id);

DROP POLICY IF EXISTS "Users can update related reviews" ON public.reviews;
CREATE POLICY "Users can update related reviews" 
ON public.reviews FOR UPDATE 
USING ((select auth.uid())::text = client_id OR (select auth.uid())::text = tech_id);

DROP POLICY IF EXISTS "Clients can delete own reviews" ON public.reviews;
CREATE POLICY "Clients can delete own reviews" 
ON public.reviews FOR DELETE 
USING ((select auth.uid())::text = client_id);

-- --- WEEKLY TEMPLATES ---
DROP POLICY IF EXISTS "Techs manage own templates" ON public.weekly_templates;
CREATE POLICY "Techs manage own templates" 
ON public.weekly_templates FOR ALL 
USING ((select auth.uid())::text = tech_id);

-- --- DAY BLOCKS ---
DROP POLICY IF EXISTS "Techs manage own blocks" ON public.day_blocks;
CREATE POLICY "Techs manage own blocks" 
ON public.day_blocks FOR ALL 
USING ((select auth.uid())::text = tech_id);

-- --- SECURITY AUDIT LOG ---
DROP POLICY IF EXISTS "Admins view logs" ON public.security_audit_log;
CREATE POLICY "Admins view logs" 
ON public.security_audit_log FOR SELECT 
USING ((select auth.uid())::text IN (SELECT id FROM public.users WHERE role = 'ADMIN'));

DROP POLICY IF EXISTS "System can insert logs" ON public.security_audit_log;
CREATE POLICY "System can insert logs" 
ON public.security_audit_log FOR INSERT 
WITH CHECK ((select auth.role()) = 'authenticated');


-- =============================================================================
-- 4. FIX UNINDEXED FOREIGN KEY (reviews.client_id)
-- =============================================================================
-- Add an index to cover the foreign key for better query performance.
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);


-- =============================================================================
-- 5. REMOVE UNUSED INDEXES (OPTIONAL - Review before running)
-- =============================================================================
-- These indexes have never been used. Removing them saves storage and speeds up writes.
-- CAUTION: Only run these if your app is in production and you've verified they aren't needed.

-- DROP INDEX IF EXISTS public.idx_users_role;
-- DROP INDEX IF EXISTS public.idx_users_email;
-- DROP INDEX IF EXISTS public.idx_appointments_client;
-- DROP INDEX IF EXISTS public.idx_appointments_status;
-- DROP INDEX IF EXISTS public.idx_audit_log_table_record;
-- DROP INDEX IF EXISTS public.idx_audit_log_user;
