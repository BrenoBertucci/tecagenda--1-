-- =============================================================================
-- Fix for "Function Search Path Mutable" vulnerabilities
-- Run ALL commands below in Supabase SQL Editor
-- =============================================================================

-- 1. audit_trigger_function
ALTER FUNCTION public.audit_trigger_function() SET search_path = '';

-- 2. check_cancellation_policy
ALTER FUNCTION public.check_cancellation_policy() SET search_path = '';

-- 3. create_default_commercial_template
ALTER FUNCTION public.create_default_commercial_template(p_tech_id text) SET search_path = '';

-- 4. generate_schedule_from_template
ALTER FUNCTION public.generate_schedule_from_template(p_tech_id text, p_start_date date, p_days_ahead integer) SET search_path = '';

-- 5. get_authenticated_user
ALTER FUNCTION public.get_authenticated_user() SET search_path = '';

-- 6. get_blocked_dates
ALTER FUNCTION public.get_blocked_dates(p_tech_id text, p_start_date date, p_end_date date) SET search_path = '';

-- 7. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- 8. is_admin
ALTER FUNCTION public.is_admin() SET search_path = '';

-- 9. soft_delete_record
ALTER FUNCTION public.soft_delete_record(table_name text, record_id text) SET search_path = '';

-- 10. update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- 11. validate_weekly_template
ALTER FUNCTION public.validate_weekly_template(p_start_time time without time zone, p_end_time time without time zone) SET search_path = '';

-- =============================================================================
-- NOTE: For "Leaked Password Protection Disabled":
-- Go to Authentication -> Settings -> Security -> Enable "Prevent use of leaked passwords"
-- =============================================================================
