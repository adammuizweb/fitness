export type Role = 'user' | 'admin'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  exercise_id: string
  sets: number
  reps: number
  weight: number | null
  notes: string | null
  logged_date: string
  created_at: string
  updated_at: string
  exercise?: Exercise
}

export interface DailyStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  updated_at: string
}

export interface WorkoutLogInput {
  exercise_id: string
  sets: number
  reps: number
  weight?: number
  notes?: string
  logged_date?: string
}

export interface ExerciseInput {
  name: string
  description?: string
}

export interface StatsOverview {
  total_users: number
  total_logs_today: number
  total_logs_this_week: number
  total_logs_this_month: number
  avg_logs_per_user: number
  top_exercises: { name: string; count: number }[]
}
