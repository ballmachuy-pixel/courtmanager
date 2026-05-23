-- Migration: Add session balance RPC functions
-- Description: Functions to safely increment/decrement student session_balance

BEGIN;

CREATE OR REPLACE FUNCTION public.decrement_student_balance(p_student_id UUID, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.students
  SET session_balance = session_balance - p_amount
  WHERE id = p_student_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_student_balance(p_student_id UUID, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.students
  SET session_balance = session_balance + p_amount
  WHERE id = p_student_id;
END;
$$;

COMMIT;
