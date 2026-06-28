-- Rest days: user can mark certain days of week as rest
CREATE TABLE IF NOT EXISTS public.rest_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_rest_days_user ON public.rest_days(user_id);

ALTER TABLE public.rest_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rest days"
  ON public.rest_days FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
