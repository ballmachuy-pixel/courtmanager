-- Migration: Payroll V2 Restructure
-- Description: Replaces old payroll structure with detailed contracts, rates, and payroll items

BEGIN;

-- 1. Drop old structures (cleaning up V1)
DROP TABLE IF EXISTS public.payrolls CASCADE;

ALTER TABLE public.academy_members 
DROP COLUMN IF EXISTS base_salary,
DROP COLUMN IF EXISTS per_session_rate;

-- 2. Create coach_salary_contracts table
CREATE TABLE IF NOT EXISTS public.coach_salary_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    base_salary DECIMAL(12, 0) NOT NULL DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create coach_class_rates table
CREATE TABLE IF NOT EXISTS public.coach_class_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    rate_amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(coach_id, class_id)
);

-- 4. Create payrolls (V2) table
CREATE TABLE IF NOT EXISTS public.payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    total_earnings DECIMAL(12, 0) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(12, 0) NOT NULL DEFAULT 0,
    net_amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(coach_id, period_start_date, period_end_date)
);

-- 5. Create payroll_items table
CREATE TABLE IF NOT EXISTS public.payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID NOT NULL REFERENCES public.payrolls(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('BASE_SALARY', 'SESSION_FEE', 'ALLOWANCE', 'DEDUCTION')),
    reference_id UUID, -- could be attendance_id
    amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies

ALTER TABLE public.coach_salary_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_class_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

-- Contract RLS
CREATE POLICY "Academy owner can manage contracts" 
    ON public.coach_salary_contracts FOR ALL 
    USING (
        coach_id IN (
            SELECT id FROM public.academy_members WHERE academy_id IN (
                SELECT id FROM public.academies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Coach can view own contract" 
    ON public.coach_salary_contracts FOR SELECT 
    USING (
        coach_id IN (
            SELECT id FROM public.academy_members WHERE user_id = auth.uid()
        )
    );

-- Rates RLS
CREATE POLICY "Academy owner can manage rates" 
    ON public.coach_class_rates FOR ALL 
    USING (
        coach_id IN (
            SELECT id FROM public.academy_members WHERE academy_id IN (
                SELECT id FROM public.academies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Coach can view own rates" 
    ON public.coach_class_rates FOR SELECT 
    USING (
        coach_id IN (
            SELECT id FROM public.academy_members WHERE user_id = auth.uid()
        )
    );

-- Payrolls RLS
CREATE POLICY "Academy owner can manage payrolls" 
    ON public.payrolls FOR ALL 
    USING (
        academy_id IN (
            SELECT id FROM public.academies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Coach can view own payrolls" 
    ON public.payrolls FOR SELECT 
    USING (
        coach_id IN (
            SELECT id FROM public.academy_members WHERE user_id = auth.uid()
        )
    );

-- Payroll Items RLS
CREATE POLICY "Academy owner can manage payroll items" 
    ON public.payroll_items FOR ALL 
    USING (
        payroll_id IN (
            SELECT id FROM public.payrolls WHERE academy_id IN (
                SELECT id FROM public.academies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Coach can view own payroll items" 
    ON public.payroll_items FOR SELECT 
    USING (
        payroll_id IN (
            SELECT id FROM public.payrolls WHERE coach_id IN (
                SELECT id FROM public.academy_members WHERE user_id = auth.uid()
            )
        )
    );

COMMIT;
