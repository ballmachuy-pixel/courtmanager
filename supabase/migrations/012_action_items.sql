-- BMad V6 - Story 7.1: Action Items Table for Customer Retention

CREATE TABLE IF NOT EXISTS public.action_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.academy_members(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view action items in their academy"
    ON public.action_items FOR SELECT
    USING (academy_id IN (
        SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert action items in their academy"
    ON public.action_items FOR INSERT
    WITH CHECK (academy_id IN (
        SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update action items in their academy"
    ON public.action_items FOR UPDATE
    USING (academy_id IN (
        SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
    ));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;
