-- Migration 003: Add session tracking and token expiry

-- 1. Add remaining_sessions to student_classes to track course validity
ALTER TABLE public.student_classes 
ADD COLUMN remaining_sessions INTEGER DEFAULT 0;

-- 2. Add token_expires_at to parent_profiles for security
ALTER TABLE public.parent_profiles 
ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE;
