-- Security Fixes Script
-- Run this in your Supabase SQL Editor

-- 1. Prevent Double Booking (Race Condition)
-- Add a unique constraint to ensure a technician cannot be booked twice for the same slot
ALTER TABLE appointments
ADD CONSTRAINT unique_tech_date_time UNIQUE (tech_id, date, time);

-- 2. Enforce 24h Cancellation Rule
-- Function to check if cancellation is allowed
CREATE OR REPLACE FUNCTION check_cancellation_policy()
RETURNS TRIGGER AS $$
DECLARE
    appointment_timestamp TIMESTAMP;
    hours_difference NUMERIC;
BEGIN
    -- Only run this check if status is changing to CANCELLED and user is a CLIENT
    -- (Assuming we can identify the user role via auth.uid() or similar, but for now enforcing the rule generally for the appointment)
    -- Ideally, we should check if auth.uid() == old.client_id to apply this strict rule only to clients, 
    -- but let's enforce it as a general business rule for now or check the current user role if possible.
    
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        -- Construct timestamp from date and time columns
        appointment_timestamp := (OLD.date || ' ' || OLD.time)::TIMESTAMP;
        
        -- Calculate difference in hours
        hours_difference := EXTRACT(EPOCH FROM (appointment_timestamp - NOW())) / 3600;
        
        -- If less than 24h, raise error
        IF hours_difference < 24 THEN
            RAISE EXCEPTION 'Cancelamento não permitido com menos de 24 horas de antecedência.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before update on appointments
DROP TRIGGER IF EXISTS enforce_cancellation_policy ON appointments;
CREATE TRIGGER enforce_cancellation_policy
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION check_cancellation_policy();

-- 3. Secure Registration (Optional Helper)
-- You can use this function to safely assign roles if you disable client-side role assignment
-- CREATE OR REPLACE FUNCTION public.handle_new_user() 
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.users (id, email, role, name)
--   VALUES (new.id, new.email, 'CLIENT', new.raw_user_meta_data->>'name');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
