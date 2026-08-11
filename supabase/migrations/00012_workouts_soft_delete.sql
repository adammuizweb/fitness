-- Soft delete is separate from is_active, which only controls visibility.
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_workouts_user_deleted_at
  ON public.workouts(user_id, deleted_at);
