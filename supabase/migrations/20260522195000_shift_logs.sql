-- Migration: Create shift_logs table for Shift Handover feature
-- Description: Stores shift handover notes and alert snapshots

BEGIN;

CREATE TABLE IF NOT EXISTS public.shift_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shift_note TEXT NOT NULL,
    unresolved_issues JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shift_logs_academy_id ON public.shift_logs(academy_id);
CREATE INDEX IF NOT EXISTS idx_shift_logs_created_at ON public.shift_logs(created_at DESC);

-- RLS
ALTER TABLE public.shift_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shift logs of their academies" 
    ON public.shift_logs FOR SELECT 
    USING (
        academy_id IN (
            SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
        )
        OR 
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create shift logs for their academies" 
    ON public.shift_logs FOR INSERT 
    WITH CHECK (
        academy_id IN (
            SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
        )
        OR 
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

COMMIT;
