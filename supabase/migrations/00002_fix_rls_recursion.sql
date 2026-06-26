-- Fix infinite recursion in RLS policies
-- The issue: Admin policies query profiles table, which triggers RLS again

-- Create a SECURITY DEFINER function that bypasses RLS for admin checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Drop old admin policies on profiles
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;

-- Recreate using is_admin() which bypasses RLS
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Drop old admin policies on exercises
DROP POLICY IF EXISTS "Admins read all exercises" ON public.exercises;

CREATE POLICY "Admins read all exercises"
  ON public.exercises FOR SELECT
  USING (public.is_admin());

-- Drop old admin policies on workout_logs
DROP POLICY IF EXISTS "Admins read all logs" ON public.workout_logs;

CREATE POLICY "Admins read all logs"
  ON public.workout_logs FOR SELECT
  USING (public.is_admin());

-- Drop old admin policies on daily_streaks
DROP POLICY IF EXISTS "Admins read all streaks" ON public.daily_streaks;

CREATE POLICY "Admins read all streaks"
  ON public.daily_streaks FOR SELECT
  USING (public.is_admin());
