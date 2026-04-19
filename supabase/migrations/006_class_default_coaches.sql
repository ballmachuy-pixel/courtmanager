-- Migration 006: Support for Default Coaches at Class level
-- This allows Admin to set a team of coaches for a class once, which propagates to all schedules.

-- 1. Create class_default_coaches mapping table
CREATE TABLE IF NOT EXISTS public.class_default_coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Ensure a coach is not assigned multiple times to the same class
    UNIQUE(class_id, coach_id)
);

-- 2. Add RLS policies (simple for now, following project patterns)
ALTER TABLE public.class_default_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read class_default_coaches"
ON public.class_default_coaches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin to manage class_default_coaches"
ON public.class_default_coaches FOR ALL
TO authenticated
USING (true);

-- 3. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_class_default_coaches_class_id ON public.class_default_coaches(class_id);

-- 4. Initial cleanup: If any classes have head_coach_id, populate the new table as a starting point
-- This ensures existing data is migrated.
INSERT INTO public.class_default_coaches (class_id, coach_id)
SELECT id, head_coach_id 
FROM public.classes 
WHERE head_coach_id IS NOT NULL
ON CONFLICT DO NOTHING;
