-- Migration: Add payroll feature
-- Description: Adds salary info to academy_members and creates payrolls table

BEGIN;

-- 1. Add contract fields to academy_members
ALTER TABLE public.academy_members 
ADD COLUMN IF NOT EXISTS base_salary DECIMAL(12, 0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS per_session_rate DECIMAL(12, 0) DEFAULT 0;

-- 2. Create payrolls table
CREATE TABLE IF NOT EXISTS public.payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    base_amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
    session_count INT NOT NULL DEFAULT 0,
    session_bonus DECIMAL(12, 0) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(academy_id, manager_id, month, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payrolls_academy_id ON public.payrolls(academy_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_month_year ON public.payrolls(month, year);

-- RLS
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage payrolls" 
    ON public.payrolls FOR ALL 
    USING (
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can view their own payroll" 
    ON public.payrolls FOR SELECT 
    USING (
        manager_id IN (
            SELECT id FROM public.academy_members WHERE user_id = auth.uid()
        )
    );

COMMIT;
