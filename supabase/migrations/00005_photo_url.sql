-- Add photo_url column to workout_logs
ALTER TABLE public.workout_logs ADD COLUMN photo_url TEXT;

-- Optional: index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_logs_photo ON public.workout_logs(photo_url) WHERE photo_url IS NOT NULL;
