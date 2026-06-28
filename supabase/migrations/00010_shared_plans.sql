-- Weekly schedule plan sharing
CREATE TABLE IF NOT EXISTS public.shared_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_plans_user ON public.shared_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_plans_created ON public.shared_plans(created_at DESC);

ALTER TABLE public.shared_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages shared plans"
  ON public.shared_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read shared plans"
  ON public.shared_plans FOR SELECT
  USING (true);

-- Plan days: snapshot of each day's workout in the plan
CREATE TABLE IF NOT EXISTS public.shared_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  workout_name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('lift', 'cardio')),
  default_sets INTEGER,
  default_reps INTEGER,
  default_distance NUMERIC,
  default_duration INTEGER,
  is_rest BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON public.shared_plan_days(plan_id);

ALTER TABLE public.shared_plan_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages plan days"
  ON public.shared_plan_days FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.shared_plans WHERE id = plan_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shared_plans WHERE id = plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Anyone can read plan days"
  ON public.shared_plan_days FOR SELECT
  USING (true);
