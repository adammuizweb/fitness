-- Replace single photo_url with photos array
ALTER TABLE public.workout_logs ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Migrate existing photo_url values into photos array
UPDATE public.workout_logs SET photos = ARRAY[photo_url] WHERE photo_url IS NOT NULL;

-- Remove old column
ALTER TABLE public.workout_logs DROP COLUMN IF EXISTS photo_url;

-- Drop old index
DROP INDEX IF EXISTS idx_workout_logs_photo;

-- Create index on photos array (GIN for array membership queries)
CREATE INDEX IF NOT EXISTS idx_workout_logs_photos ON public.workout_logs USING GIN (photos);

-- Upload rate limit tracking
CREATE TABLE IF NOT EXISTS public.upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_logs_user_date ON public.upload_logs(user_id, created_at);

ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own upload logs"
  ON public.upload_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own upload logs"
  ON public.upload_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all upload logs"
  ON public.upload_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
