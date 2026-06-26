-- ============================================
-- Migration: workouts + scheduling + checklist
-- ============================================

-- 1. EXERCISES → WORKOUTS (add type column)
ALTER TABLE public.exercises RENAME TO workouts;
ALTER INDEX public.idx_exercises_user_id RENAME TO idx_workouts_user_id;

ALTER TABLE public.workouts ADD COLUMN type TEXT NOT NULL DEFAULT 'lift' CHECK (type IN ('lift', 'cardio'));
ALTER TABLE public.workouts ADD COLUMN default_sets INTEGER CHECK (default_sets > 0);
ALTER TABLE public.workouts ADD COLUMN default_reps INTEGER CHECK (default_reps > 0);
ALTER TABLE public.workouts ADD COLUMN default_distance DECIMAL(8,2) CHECK (default_distance >= 0);
ALTER TABLE public.workouts ADD COLUMN default_duration INTEGER CHECK (default_duration > 0);

-- 2. WORKOUT SCHEDULES (new table)
CREATE TABLE public.workout_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id  UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, workout_id, day_of_week)
);
CREATE INDEX idx_schedules_user_day ON public.workout_schedules(user_id, day_of_week);

-- 3. WORKOUT LOGS (add is_done, cardio fields; rename exercise_id)
ALTER TABLE public.workout_logs ADD COLUMN is_done   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.workout_logs ADD COLUMN distance   DECIMAL(8,2) CHECK (distance >= 0);
ALTER TABLE public.workout_logs ADD COLUMN duration   INTEGER CHECK (duration > 0);

-- Make sets/reps/weight nullable (for cardio and unchecked logs)
ALTER TABLE public.workout_logs ALTER COLUMN sets DROP NOT NULL;
ALTER TABLE public.workout_logs ALTER COLUMN reps DROP NOT NULL;
ALTER TABLE public.workout_logs DROP CONSTRAINT workout_logs_sets_check;
ALTER TABLE public.workout_logs DROP CONSTRAINT workout_logs_reps_check;
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_sets_check CHECK (sets IS NULL OR sets > 0);
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_reps_check CHECK (reps IS NULL OR reps > 0);

-- Rename exercise_id → workout_id
ALTER TABLE public.workout_logs RENAME COLUMN exercise_id TO workout_id;
ALTER INDEX public.idx_workout_logs_exercise RENAME TO idx_workout_logs_workout;

-- Update unique constraint
ALTER TABLE public.workout_logs DROP CONSTRAINT IF EXISTS workout_logs_user_id_exercise_id_logged_date_key;
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_user_id_workout_id_logged_date_key UNIQUE(user_id, workout_id, logged_date);

-- Update foreign key
ALTER TABLE public.workout_logs DROP CONSTRAINT IF EXISTS workout_logs_exercise_id_fkey;
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;

-- 4. RLS: WORKOUTS (replacing exercises policies)
DROP POLICY IF EXISTS "Users manage own exercises" ON public.workouts;
DROP POLICY IF EXISTS "Admins read all exercises" ON public.workouts;

CREATE POLICY "Users manage own workouts"
  ON public.workouts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all workouts"
  ON public.workouts FOR SELECT
  USING (public.is_admin());

-- 5. RLS: WORKOUT SCHEDULES
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedules"
  ON public.workout_schedules FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all schedules"
  ON public.workout_schedules FOR SELECT
  USING (public.is_admin());

-- 6. Update streak trigger for is_done
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
DECLARE
  yesterday DATE;
  last_date DATE;
BEGIN
  -- Only count when is_done = true
  IF NOT NEW.is_done THEN
    RETURN NEW;
  END IF;

  SELECT last_activity_date INTO last_date
  FROM public.daily_streaks
  WHERE user_id = NEW.user_id;

  yesterday := CURRENT_DATE - 1;

  IF last_date IS NULL OR last_date < CURRENT_DATE THEN
    UPDATE public.daily_streaks
    SET
      last_activity_date = NEW.logged_date,
      current_streak = CASE
        WHEN last_date = yesterday THEN current_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_workout_log_inserted ON public.workout_logs;
CREATE TRIGGER on_workout_log_changed
  AFTER INSERT OR UPDATE OF is_done ON public.workout_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- 7. Update admin stats function (exercises → workouts, exercise_id → workout_id)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_logs_today', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date = CURRENT_DATE AND is_done = TRUE),
    'total_logs_this_week', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date >= CURRENT_DATE - INTERVAL '7 days' AND is_done = TRUE),
    'total_logs_this_month', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date >= DATE_TRUNC('month', CURRENT_DATE) AND is_done = TRUE),
    'avg_logs_per_user', COALESCE(
      (SELECT COUNT(*)::float / NULLIF(COUNT(DISTINCT user_id), 0) FROM public.workout_logs WHERE is_done = TRUE), 0
    ),
    'top_exercises', (
      SELECT COALESCE(json_agg(json_build_object('name', w.name, 'count', cnt)), '[]'::json)
      FROM (
        SELECT wl.workout_id, COUNT(*) as cnt
        FROM public.workout_logs wl
        WHERE wl.is_done = TRUE
        GROUP BY wl.workout_id
        ORDER BY cnt DESC
        LIMIT 5
      ) top
      JOIN public.workouts w ON w.id = top.workout_id
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
