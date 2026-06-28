-- Shared workout templates (public, visible on community profiles)
CREATE TABLE IF NOT EXISTS public.shared_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lift', 'cardio')),
  default_sets INTEGER,
  default_reps INTEGER,
  default_distance NUMERIC,
  default_duration INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_workouts_user ON public.shared_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_workouts_created ON public.shared_workouts(created_at DESC);

ALTER TABLE public.shared_workouts ENABLE ROW LEVEL SECURITY;

-- Owner can CRUD
CREATE POLICY "Owner manages shared workouts"
  ON public.shared_workouts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read shared workouts (privacy gate in application)
CREATE POLICY "Anyone can read shared workouts"
  ON public.shared_workouts FOR SELECT
  USING (true);

-- Copied workout reference: track original share source
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS copied_from_share_id UUID REFERENCES public.shared_workouts(id) ON DELETE SET NULL;

-- Link shared workout to its source workout (prevents duplicate sharing)
ALTER TABLE public.shared_workouts ADD COLUMN IF NOT EXISTS source_workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL;
