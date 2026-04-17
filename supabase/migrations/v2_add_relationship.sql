-- Add parent_relationship column to students table to track link specifically for each child
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_relationship TEXT DEFAULT 'guardian';

-- Optional: Initial migration of relationship data if needed (though parents table took most info)
COMMENT ON COLUMN public.students.parent_relationship IS 'Relationship to the linked parent (e.g., father, mother, guardian)';
