-- Add profile visibility
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- Posts for sharing workout activities
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_log_id UUID REFERENCES public.workout_logs(id) ON DELETE SET NULL,
  caption TEXT,
  photos TEXT[] DEFAULT '{}',
  privacy TEXT NOT NULL DEFAULT 'only_me' CHECK (privacy IN ('only_me', 'friends', 'followers', 'all')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON public.posts(privacy);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Follows system
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, followee_id),
  CHECK (follower_id != followee_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON public.follows(followee_id);

-- RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Users can CRUD own posts
CREATE POLICY "Users manage own posts"
  ON public.posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Visible posts depend on privacy + follow status (handled in application queries)

-- RLS for follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Users can see their own follows
CREATE POLICY "Users manage own follows"
  ON public.follows FOR ALL
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);
