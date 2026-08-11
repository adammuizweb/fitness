-- Keep internal Custom Activity templates out of the workout manager while
-- allowing regular inactive workouts to be restored.
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS is_custom_activity BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill templates created by the existing Custom Activity flow.
UPDATE public.workouts AS workout
SET is_custom_activity = TRUE
WHERE workout.is_active = FALSE
  AND NOT EXISTS (
    SELECT 1
    FROM public.workout_schedules AS schedule
    WHERE schedule.workout_id = workout.id
  )
  AND EXISTS (
    SELECT 1
    FROM public.workout_logs AS log
    WHERE log.workout_id = workout.id
      AND log.notes = workout.name
      AND log.sets = 1
      AND log.reps = 1
  );

CREATE INDEX IF NOT EXISTS idx_workouts_user_custom_activity
  ON public.workouts(user_id, is_custom_activity);
