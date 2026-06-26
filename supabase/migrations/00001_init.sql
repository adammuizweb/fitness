-- ============================================
-- Fitnes Tracker — Initial Schema
-- ============================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EXERCISES
CREATE TABLE public.exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_exercises_user_id ON public.exercises(user_id);

-- 3. WORKOUT LOGS
CREATE TABLE public.workout_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets        INTEGER NOT NULL CHECK (sets > 0),
  reps        INTEGER NOT NULL CHECK (reps > 0),
  weight      DECIMAL(6,2) CHECK (weight >= 0),
  notes       TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, exercise_id, logged_date)
);
CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, logged_date);
CREATE INDEX idx_workout_logs_exercise ON public.workout_logs(exercise_id);

-- 4. DAILY STREAKS
CREATE TABLE public.daily_streaks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_activity_date  DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile + streak on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  INSERT INTO public.daily_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update streak on new workout log
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
DECLARE
  yesterday DATE;
  last_date DATE;
BEGIN
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

CREATE OR REPLACE TRIGGER on_workout_log_inserted
  AFTER INSERT ON public.workout_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own exercises"
  ON public.exercises FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all exercises"
  ON public.exercises FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Workout Logs
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own logs"
  ON public.workout_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all logs"
  ON public.workout_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Daily Streaks
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own streak"
  ON public.daily_streaks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all streaks"
  ON public.daily_streaks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- ADMIN STATS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_logs_today', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date = CURRENT_DATE),
    'total_logs_this_week', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date >= CURRENT_DATE - INTERVAL '7 days'),
    'total_logs_this_month', (SELECT COUNT(*) FROM public.workout_logs WHERE logged_date >= DATE_TRUNC('month', CURRENT_DATE)),
    'avg_logs_per_user', COALESCE(
      (SELECT COUNT(*)::float / NULLIF(COUNT(DISTINCT user_id), 0) FROM public.workout_logs), 0
    ),
    'top_exercises', (
      SELECT COALESCE(json_agg(json_build_object('name', e.name, 'count', cnt)), '[]'::json)
      FROM (
        SELECT wl.exercise_id, COUNT(*) as cnt
        FROM public.workout_logs wl
        GROUP BY wl.exercise_id
        ORDER BY cnt DESC
        LIMIT 5
      ) top
      JOIN public.exercises e ON e.id = top.exercise_id
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
