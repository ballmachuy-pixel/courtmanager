-- Migration: Add CRM and Trial Classes Feature
-- Description: Creates leads and trial_requests tables

BEGIN;

-- 1. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    parent_name TEXT,
    parent_phone TEXT,
    date_of_birth DATE,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'scheduled', 'trialed', 'follow_up', 'won', 'lost')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying leads by academy
CREATE INDEX IF NOT EXISTS idx_leads_academy_id ON public.leads(academy_id);

-- 2. Create trial_requests table
CREATE TABLE IF NOT EXISTS public.trial_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    trial_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'attended', 'no_show')),
    coach_evaluation TEXT CHECK (coach_evaluation IN ('good', 'average', 'needs_practice', null)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up trials by schedule (for coach attendance)
CREATE INDEX IF NOT EXISTS idx_trial_requests_schedule_date ON public.trial_requests(schedule_id, trial_date);

-- RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage leads for their academy" 
    ON public.leads FOR ALL 
    USING (
        academy_id IN (
            SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
        )
    );

-- RLS for trial_requests
ALTER TABLE public.trial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage trials for their academy" 
    ON public.trial_requests FOR ALL 
    USING (
        lead_id IN (
            SELECT id FROM public.leads WHERE academy_id IN (
                SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
            )
        )
    );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
