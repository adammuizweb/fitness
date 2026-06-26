# Fitnes Tracker — AGENTS.md

> Aplikasi web fitness tracker dengan sistem streak harian, multi-user, admin panel, dan PWA.
> Domain: `fitnes.adammuiz.com` — deployed via Vercel.

## Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | **Next.js 15** (App Router) | React modern, SSR/SSG/ISR, API routes, middleware |
| Language | **TypeScript** strict | Type safety, better DX |
| Database & Auth | **Supabase** | PostgreSQL gratis, auth built-in, realtime, row-level security |
| UI | **Tailwind CSS v4** + **shadcn/ui** | Komponen reusable, Radix UI, aksesibel |
| PWA | **@serwist/next** | Service worker, offline support, manifest |
| Form | **React Hook Form** + **Zod** | Validasi tipe-safe |
| Server State | **TanStack Query** | Caching, optimistic updates |
| Charts | **recharts** | Statistik admin |
| Deployment | **Vercel** (free) | CI/CD dari GitHub, custom domain, serverless |
| Package Manager | **npm** | Yang tersedia di server |

## Struktur Project

```
/var/www/fitnes.lan/
├── AGENTS.md                  ← blueprint ini
├── .env.example               ← contoh env untuk Supabase
├── .env.local                 ← env lokal (gitignore)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── manifest.json          ← PWA manifest
│   ├── sw.js                  ← service worker
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── layout.tsx         ← Root layout (Supabase provider, theme)
│   │   ├── page.tsx           ← Landing / redirect ke dashboard
│   │   ├── globals.css        ← Tailwind imports
│   │   ├── (auth)/            ← Route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts   ← Supabase auth callback
│   │   ├── (dashboard)/       ← Route group (with sidebar layout)
│   │   │   ├── layout.tsx     ← Dashboard layout + Sidebar
│   │   │   ├── page.tsx       ← Today's overview
│   │   │   ├── workouts/
│   │   │   │   ├── page.tsx   ← List exercises
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── log/
│   │   │   │   ├── page.tsx   ← Log workout hari ini
│   │   │   │   └── history/page.tsx
│   │   │   ├── streak/
│   │   │   │   └── page.tsx   ← Streak calendar + stats
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── admin/             ← Admin routes (role guard)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       ← Admin dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx   ← Daftar users
│   │   │   │   └── [id]/page.tsx ← Edit user, ban
│   │   │   └── stats/
│   │   │       └── page.tsx   ← Statistik penggunaan
│   │   └── api/               ← API routes
│   │       ├── exercises/
│   │       │   ├── route.ts   ← GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts ← PUT, DELETE
│   │       ├── logs/
│   │       │   ├── route.ts   ← GET (list with date filter), POST
│   │       │   └── [id]/
│   │       │       └── route.ts ← PUT, DELETE
│   │       ├── streak/
│   │       │   └── route.ts   ← GET (user streak)
│   │       └── admin/
│   │           ├── users/
│   │           │   ├── route.ts ← GET (list all users)
│   │           │   └── [id]/
│   │           │       └── route.ts ← PUT (update role, ban)
│   │           └── stats/
│   │               └── route.ts ← GET (usage stats)
│   ├── components/
│   │   ├── ui/               ← shadcn/ui components
│   │   ├── auth/
│   │   │   ├── AuthGuard.tsx  ← Protect routes
│   │   │   ├── AdminGuard.tsx ← Protect admin routes
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── workouts/
│   │   │   ├── WorkoutList.tsx
│   │   │   ├── WorkoutCard.tsx
│   │   │   ├── WorkoutForm.tsx
│   │   │   └── WorkoutDeleteDialog.tsx
│   │   ├── logs/
│   │   │   ├── LogForm.tsx
│   │   │   ├── LogList.tsx
│   │   │   └── LogCard.tsx
│   │   ├── streak/
│   │   │   ├── StreakCalendar.tsx
│   │   │   └── StreakStats.tsx
│   │   ├── admin/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserEditForm.tsx
│   │   │   └── StatsChart.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Navbar.tsx
│   │       ├── MobileNav.tsx
│   │       └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      ← Supabase browser client
│   │   │   ├── server.ts      ← Supabase server client
│   │   │   └── admin.ts      ← Supabase service role (admin only)
│   │   ├── auth.ts           ← Auth helpers
│   │   ├── utils.ts          ← cn(), formatDate(), etc.
│   │   └── validations.ts    ← Zod schemas
│   ├── hooks/
│   │   ├── useExercises.ts
│   │   ├── useLogs.ts
│   │   ├── useStreak.ts
│   │   ├── useAdmin.ts
│   │   └── useUser.ts
│   └── types/
│       └── index.ts          ← TypeScript interfaces
├── supabase/
│   ├── migrations/
│   │   └── 00001_init.sql    ← Schema awal
│   └── seed.sql              ← Seed data (admin user, contoh)
```

## Database Schema (Supabase / PostgreSQL)

### Tables

#### profiles (extends auth.users)
```sql
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
```

#### exercises (template library — tiap user punya daftar exercises sendiri)
```sql
CREATE TABLE public.exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Index: user_id for fast lookup
CREATE INDEX idx_exercises_user_id ON public.exercises(user_id);
```

#### workout_logs (daily entries)
```sql
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
  -- Unique constraint: one log per exercise per day per user
  UNIQUE(user_id, exercise_id, logged_date)
);
CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, logged_date);
CREATE INDEX idx_workout_logs_exercise ON public.workout_logs(exercise_id);
```

#### daily_streaks (chain tracker)
```sql
CREATE TABLE public.daily_streaks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_activity_date  DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- profiles: user read own, admin read all
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

-- exercises: user CRUD own, admin read all
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own exercises"
  ON public.exercises FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all exercises"
  ON public.exercises FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- workout_logs: same pattern
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own logs"
  ON public.workout_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all logs"
  ON public.workout_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- daily_streaks: user read own, admin read all
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own streak"
  ON public.daily_streaks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all streaks"
  ON public.daily_streaks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Triggers

### Auto-create profile on signup
```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Auto-update streak on new workout log
```sql
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
      longest_streak = GREATEST(longest_streak, current_streak),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workout_log_inserted
  AFTER INSERT ON public.workout_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();
```

## Fitur Detail

### 1. Auth (Supabase Auth)
- Register: email + password + username
- Login: email + password
- Magic link opsional
- Session management via Supabase cookies (server-side)
- Role: `user` (default), `admin`

### 2. Workout Exercises (CRUD)
- Setiap user punya daftar exercise sendiri
- Field: nama, deskripsi (opsional)
- Bisa edit, hapus
- Muncul di dropdown saat logging

### 3. Daily Log
- Pilih exercise dari daftar
- Input: sets, reps, weight (opsional), notes (opsional)
- Otomatis pakai `logged_date = CURRENT_DATE`
- Cumulative: kalau sudah log hari ini, bisa update (unique constraint)
- Riwayat: lihat log berdasarkan tanggal (date picker)

### 4. Streak Chain
- Kalau user log workout hari ini → streak +1
- Kalau skip sehari → streak reset ke 0
- Tampilkan: current streak, longest streak
- GitHub-style contribution calendar (12 bulan ke belakang)
- Warna: hijau gradient sesuai intensity (berapa hari berturut-turut)
- Fire emoji 🔥 kalau streak >= 7
- Pesan peringatan kalau streak mau reset

### 5. Dashboard (Home)
- Ringkasan hari ini: total exercises logged, total sets, total reps
- Streak saat ini + progress bar ke streak berikutnya
- Tombol cepat "Log Workout"
- Recently used exercises

### 6. Admin Panel
- **Users**: tabel semua user, search, filter by role/status
- **Edit User**: ubah role (user/admin), ban/unban, reset streak
- **Stats**: total users, total logs hari ini/minggu/bulan, average logs per user, top exercises

### 7. PWA
- Installable ke home screen Android/iOS
- Service worker: cache static assets, offline page
- manifest.json: icon, theme color, display standalone
- Push notifications (future)

## Alur Streak

```
Hari ini log workout?
  ├── Ya → last_activity_date = kemarin?
  │         ├── Ya → current_streak + 1
  │         └── Tidak → current_streak = 1 (reset)
  └── Tidak → streak tetap (belum dihitung sampai besok)
```

Reset terjadi ketika:
- User tidak log workout selama 1 hari penuh (setelah 00:00)
- Saat user log lagi, streak dihitung dari awal

## Halaman & Routing

| Route | Akses | Deskripsi |
|---|---|---|
| `/` | Public | Landing page / redirect to dashboard if logged in |
| `/login` | Public | Login form |
| `/register` | Public | Register form |
| `/dashboard` | User | Today's overview |
| `/workouts` | User | Daftar exercise |
| `/workouts/new` | User | Tambah exercise baru |
| `/workouts/[id]/edit` | User | Edit exercise |
| `/log` | User | Log workout hari ini |
| `/log/history` | User | Riwayat log |
| `/streak` | User | Streak calendar |
| `/settings` | User | Profile settings |
| `/admin` | Admin | Admin dashboard |
| `/admin/users` | Admin | Daftar users |
| `/admin/users/[id]` | Admin | Edit user |
| `/admin/stats` | Admin | Statistik |

## Komponen UI (shadcn/ui + custom)

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `Button` | `components/ui/button.tsx` | Tombol (variants: default, destructive, outline, ghost) |
| `Card` | `components/ui/card.tsx` | Container workout/log card |
| `Dialog` | `components/ui/dialog.tsx` | Konfirmasi hapus |
| `Input` | `components/ui/input.tsx` | Form input |
| `Label` | `components/ui/label.tsx` | Form label |
| `Select` | `components/ui/select.tsx` | Dropdown exercise |
| `Table` | `components/ui/table.tsx` | Admin table |
| `Badge` | `components/ui/badge.tsx` | Status badges (admin, banned) |
| `Avatar` | `components/ui/avatar.tsx` | User avatar |
| `Calendar` | `components/ui/calendar.tsx` | Date picker |
| `Toast` | `components/ui/toast.tsx` | Notifikasi |

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fitnes Tracker
```

## Setup Langkah

1. `npm create next-app@latest . --typescript --tailwind --app`
2. `npm install @supabase/supabase-js @supabase/ssr @serwist/next`
3. `npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-avatar @radix-ui/react-toast`
4. `npm install lucide-react recharts date-fns`
5. `npm install react-hook-form @hookform/resolvers zod`
6. `npm install @tanstack/react-query`
7. Init shadcn/ui: `npx shadcn@latest init`
8. Setup Supabase project di dashboard.supabase.com
9. Jalankan SQL migration di Supabase SQL Editor
10. `npm run dev` → siap coding

## GitHub

- Repo: `https://github.com/adammuizweb/fitnes`
- Branch: `main`
- Deploy: Vercel auto-deploy dari GitHub
- Domain: `fitnes.adammuiz.com` (pointing ke Vercel)

## Deployment

1. Push ke GitHub
2. Import repo ke Vercel
3. Set environment variables di Vercel dashboard
4. Add custom domain `fitnes.adammuiz.com`
5. Update DNS: CNAME `fitnes` → `cname.vercel-dns.com`

---

> Dikerjakan dengan serius oleh opencode.ai
> Stack: Next.js 15 + TypeScript + Supabase + Tailwind CSS + shadcn/ui + PWA
