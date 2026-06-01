CREATE TABLE class_cancellations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid REFERENCES schedules(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  reason text NOT NULL,
  cancelled_by uuid REFERENCES academy_members(id) ON DELETE SET NULL,
  academy_id uuid REFERENCES academies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(schedule_id, date)
);

-- RLS Policies
ALTER TABLE class_cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone in academy can view class_cancellations" 
ON class_cancellations FOR SELECT 
USING (academy_id IN (SELECT academy_id FROM academy_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert class_cancellations" 
ON class_cancellations FOR INSERT 
WITH CHECK (
  academy_id IN (
    SELECT academy_id FROM academy_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

CREATE POLICY "Admins can delete class_cancellations" 
ON class_cancellations FOR DELETE 
USING (
  academy_id IN (
    SELECT academy_id FROM academy_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);
