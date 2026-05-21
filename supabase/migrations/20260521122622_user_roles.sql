-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin')),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles" ON user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Super admins can read all roles
CREATE POLICY "Super admins can read all roles" ON user_roles
    FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin') = 'true');

-- Create a helper function to find user id by email (SECURITY DEFINER)
-- We need this because Supabase Admin API does not have getUserByEmail
CREATE OR REPLACE FUNCTION get_user_id_by_email(lookup_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    found_id UUID;
BEGIN
    -- Only allow super admins to run this
    IF (auth.jwt() -> 'user_metadata' ->> 'is_super_admin') != 'true' THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT id INTO found_id FROM auth.users WHERE email = lookup_email LIMIT 1;
    RETURN found_id;
END;
$$;
