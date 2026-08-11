-- Admin-configurable, database-backed login rate limiting.
CREATE TABLE IF NOT EXISTS public.security_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  login_rate_limit_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  account_max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (account_max_attempts BETWEEN 1 AND 100),
  ip_max_attempts INTEGER NOT NULL DEFAULT 20 CHECK (ip_max_attempts BETWEEN 1 AND 500),
  attempt_window_minutes INTEGER NOT NULL DEFAULT 15 CHECK (attempt_window_minutes BETWEEN 1 AND 1440),
  block_minutes INTEGER NOT NULL DEFAULT 30 CHECK (block_minutes BETWEEN 1 AND 10080),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.security_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.login_rate_limits (
  key_type TEXT NOT NULL CHECK (key_type IN ('ip', 'account')),
  key_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key_type, key_hash)
);

CREATE INDEX IF NOT EXISTS idx_login_rate_limits_blocked
  ON public.login_rate_limits(blocked_until)
  WHERE blocked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_last_attempt
  ON public.login_rate_limits(last_attempt_at);

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created
  ON public.security_audit_logs(created_at DESC);

ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.security_settings FROM anon, authenticated;
REVOKE ALL ON public.login_rate_limits FROM anon, authenticated;
REVOKE ALL ON public.security_audit_logs FROM anon, authenticated;

-- Users may edit profile presentation fields, never their role or ban status.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, is_public) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  p_ip_hash TEXT,
  p_account_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.security_settings%ROWTYPE;
  v_blocked_until TIMESTAMPTZ;
  v_retry_after INTEGER;
BEGIN
  SELECT * INTO STRICT v_settings FROM public.security_settings WHERE id = 1;

  IF NOT COALESCE(v_settings.login_rate_limit_enabled, TRUE) THEN
    RETURN jsonb_build_object('allowed', TRUE, 'retry_after', 0);
  END IF;

  SELECT MAX(blocked_until)
  INTO v_blocked_until
  FROM public.login_rate_limits
  WHERE (
    (key_type = 'ip' AND key_hash = p_ip_hash)
    OR (key_type = 'account' AND key_hash = p_account_hash)
  )
  AND blocked_until > NOW();

  IF v_blocked_until IS NULL THEN
    RETURN jsonb_build_object('allowed', TRUE, 'retry_after', 0);
  END IF;

  v_retry_after := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_blocked_until - NOW())))::INTEGER);
  RETURN jsonb_build_object('allowed', FALSE, 'retry_after', v_retry_after);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_login_failure(
  p_ip_hash TEXT,
  p_account_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.security_settings%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
  v_type TEXT;
  v_hash TEXT;
  v_limit INTEGER;
  v_attempts INTEGER;
  v_window_started TIMESTAMPTZ;
  v_blocked_until TIMESTAMPTZ;
  v_max_blocked_until TIMESTAMPTZ;
  v_retry_after INTEGER := 0;
BEGIN
  SELECT * INTO STRICT v_settings FROM public.security_settings WHERE id = 1;

  IF NOT COALESCE(v_settings.login_rate_limit_enabled, TRUE) THEN
    RETURN jsonb_build_object('blocked', FALSE, 'retry_after', 0);
  END IF;

  IF random() < 0.01 THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('login_rate_limits_global', 0));
    DELETE FROM public.login_rate_limits
    WHERE ctid IN (
      SELECT ctid FROM public.login_rate_limits
      WHERE last_attempt_at < v_now - INTERVAL '7 days'
        AND (blocked_until IS NULL OR blocked_until <= v_now)
      LIMIT 500
    );
    DELETE FROM public.security_audit_logs
    WHERE ctid IN (
      SELECT ctid FROM public.security_audit_logs
      WHERE created_at < v_now - INTERVAL '180 days'
      LIMIT 500
    );
  ELSE
    PERFORM pg_advisory_xact_lock_shared(hashtextextended('login_rate_limits_global', 0));
  END IF;

  FOR v_type, v_hash, v_limit IN
    SELECT * FROM (VALUES
      ('ip'::TEXT, p_ip_hash, v_settings.ip_max_attempts),
      ('account'::TEXT, p_account_hash, v_settings.account_max_attempts)
    ) AS buckets(key_type, key_hash, max_attempts)
  LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(v_type || ':' || v_hash, 0));

    SELECT attempts, window_started_at, blocked_until
    INTO v_attempts, v_window_started, v_blocked_until
    FROM public.login_rate_limits
    WHERE key_type = v_type AND key_hash = v_hash
    FOR UPDATE;

    IF NOT FOUND THEN
      v_attempts := 1;
      v_window_started := v_now;
      v_blocked_until := NULL;
      INSERT INTO public.login_rate_limits (
        key_type, key_hash, attempts, window_started_at, blocked_until, last_attempt_at
      ) VALUES (
        v_type, v_hash, v_attempts, v_window_started, v_blocked_until, v_now
      );
    ELSE
      IF v_window_started <= v_now - make_interval(mins => v_settings.attempt_window_minutes)
        OR (v_blocked_until IS NOT NULL AND v_blocked_until <= v_now) THEN
        v_attempts := 1;
        v_window_started := v_now;
        v_blocked_until := NULL;
      ELSE
        v_attempts := v_attempts + 1;
      END IF;

      IF v_attempts >= v_limit AND NOT COALESCE(v_blocked_until > v_now, FALSE) THEN
        v_blocked_until := v_now + make_interval(mins => v_settings.block_minutes);
      END IF;

      UPDATE public.login_rate_limits
      SET attempts = v_attempts,
          window_started_at = v_window_started,
          blocked_until = v_blocked_until,
          last_attempt_at = v_now
      WHERE key_type = v_type AND key_hash = v_hash;
    END IF;

    IF v_attempts >= v_limit AND v_blocked_until IS NULL THEN
      v_blocked_until := v_now + make_interval(mins => v_settings.block_minutes);
      UPDATE public.login_rate_limits
      SET blocked_until = v_blocked_until
      WHERE key_type = v_type AND key_hash = v_hash;
    END IF;

    IF v_blocked_until IS NOT NULL
      AND (v_max_blocked_until IS NULL OR v_blocked_until > v_max_blocked_until) THEN
      v_max_blocked_until := v_blocked_until;
    END IF;
  END LOOP;

  IF v_max_blocked_until > v_now THEN
    v_retry_after := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_max_blocked_until - v_now)))::INTEGER);
  END IF;

  RETURN jsonb_build_object(
    'blocked', v_retry_after > 0,
    'retry_after', v_retry_after
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_security_settings(
  p_actor_id UUID,
  p_login_rate_limit_enabled BOOLEAN,
  p_account_max_attempts INTEGER,
  p_ip_max_attempts INTEGER,
  p_attempt_window_minutes INTEGER,
  p_block_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous JSONB;
  v_current public.security_settings%ROWTYPE;
BEGIN
  SELECT to_jsonb(settings) INTO STRICT v_previous
  FROM public.security_settings AS settings
  WHERE id = 1
  FOR UPDATE;

  UPDATE public.security_settings
  SET login_rate_limit_enabled = p_login_rate_limit_enabled,
      account_max_attempts = p_account_max_attempts,
      ip_max_attempts = p_ip_max_attempts,
      attempt_window_minutes = p_attempt_window_minutes,
      block_minutes = p_block_minutes,
      updated_at = NOW(),
      updated_by = p_actor_id
  WHERE id = 1
  RETURNING * INTO STRICT v_current;

  INSERT INTO public.security_audit_logs (actor_id, action, details)
  VALUES (
    p_actor_id,
    'security_settings_updated',
    jsonb_build_object('previous', v_previous, 'current', to_jsonb(v_current))
  );

  RETURN to_jsonb(v_current);
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_all_login_rate_limits(p_actor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('login_rate_limits_global', 0));
  DELETE FROM public.login_rate_limits;
  INSERT INTO public.security_audit_logs (actor_id, action)
  VALUES (p_actor_id, 'login_rate_limits_cleared');
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_account_login_failures(p_account_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock_shared(hashtextextended('login_rate_limits_global', 0));
  DELETE FROM public.login_rate_limits
  WHERE key_type = 'account' AND key_hash = p_account_hash;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_managed_profile(
  p_actor_id UUID,
  p_target_id UUID,
  p_role TEXT DEFAULT NULL,
  p_is_banned BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target public.profiles%ROWTYPE;
  v_current public.profiles%ROWTYPE;
  v_active_admins INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('admin_profile_updates', 0));

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_actor_id AND role = 'admin' AND is_banned = FALSE
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO STRICT v_target
  FROM public.profiles
  WHERE id = p_target_id
  FOR UPDATE;

  IF p_role IS NOT NULL AND p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  IF p_target_id = p_actor_id
    AND ((p_role = 'user') OR (p_is_banned = TRUE)) THEN
    RAISE EXCEPTION 'You cannot remove your own admin access';
  END IF;

  IF v_target.role = 'admin'
    AND ((p_role = 'user') OR (p_is_banned = TRUE)) THEN
    SELECT COUNT(*) INTO v_active_admins
    FROM public.profiles
    WHERE role = 'admin' AND is_banned = FALSE;

    IF v_active_admins <= 1 THEN
      RAISE EXCEPTION 'At least one active admin is required';
    END IF;
  END IF;

  UPDATE public.profiles
  SET role = COALESCE(p_role, role),
      is_banned = COALESCE(p_is_banned, is_banned)
  WHERE id = p_target_id
  RETURNING * INTO STRICT v_current;

  INSERT INTO public.security_audit_logs (actor_id, action, details)
  VALUES (
    p_actor_id,
    'admin_user_updated',
    jsonb_build_object(
      'target_user_id', p_target_id,
      'previous', jsonb_build_object('role', v_target.role, 'is_banned', v_target.is_banned),
      'current', jsonb_build_object('role', v_current.role, 'is_banned', v_current.is_banned)
    )
  );

  RETURN jsonb_build_object(
    'previous', to_jsonb(v_target),
    'current', to_jsonb(v_current)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_login_rate_limit(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_login_failure(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.clear_account_login_failures(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_security_settings(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.clear_all_login_rate_limits(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_admin_managed_profile(UUID, UUID, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_login_rate_limit(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_login_failure(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_account_login_failures(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_security_settings(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_all_login_rate_limits(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_admin_managed_profile(UUID, UUID, TEXT, BOOLEAN) TO service_role;

CREATE OR REPLACE FUNCTION public.is_unbanned()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_banned = FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_banned = FALSE
  );
$$;

REVOKE ALL ON FUNCTION public.is_unbanned() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_unbanned() TO authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Restrictive policies ensure a banned JWT cannot continue using the Data API.
DROP POLICY IF EXISTS "Unbanned users access profiles" ON public.profiles;
CREATE POLICY "Unbanned users access profiles" ON public.profiles
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access workouts" ON public.workouts;
CREATE POLICY "Unbanned users access workouts" ON public.workouts
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access workout logs" ON public.workout_logs;
CREATE POLICY "Unbanned users access workout logs" ON public.workout_logs
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access streaks" ON public.daily_streaks;
CREATE POLICY "Unbanned users access streaks" ON public.daily_streaks
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access schedules" ON public.workout_schedules;
CREATE POLICY "Unbanned users access schedules" ON public.workout_schedules
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access upload logs" ON public.upload_logs;
CREATE POLICY "Unbanned users access upload logs" ON public.upload_logs
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access rest days" ON public.rest_days;
CREATE POLICY "Unbanned users access rest days" ON public.rest_days
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access posts" ON public.posts;
CREATE POLICY "Unbanned users access posts" ON public.posts
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access follows" ON public.follows;
CREATE POLICY "Unbanned users access follows" ON public.follows
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access shared workouts" ON public.shared_workouts;
CREATE POLICY "Unbanned users access shared workouts" ON public.shared_workouts
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access shared plans" ON public.shared_plans;
CREATE POLICY "Unbanned users access shared plans" ON public.shared_plans
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

DROP POLICY IF EXISTS "Unbanned users access shared plan days" ON public.shared_plan_days;
CREATE POLICY "Unbanned users access shared plan days" ON public.shared_plan_days
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_unbanned()) WITH CHECK (public.is_unbanned());

-- Admin statistics are now accessed only through an authenticated server route.
REVOKE ALL ON FUNCTION public.get_admin_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO service_role;
