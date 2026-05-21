CREATE TABLE IF NOT EXISTS public.venue_feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating TEXT NOT NULL CHECK (rating IN ('GOOD', 'NEUTRAL', 'BAD')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.venue_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own feedbacks" 
ON public.venue_feedbacks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedbacks" 
ON public.venue_feedbacks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Academy Admins can view their academy feedbacks" 
ON public.venue_feedbacks FOR SELECT 
USING (
    academy_id IN (
        SELECT academy_id FROM staff WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
);
