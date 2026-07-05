export type Role = 'user' | 'admin'

export type PostPrivacy = 'only_me' | 'friends' | 'followers' | 'all'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  is_banned: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  workout_log_id: string | null
  caption: string | null
  photos: string[]
  privacy: PostPrivacy
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Follow {
  id: string
  follower_id: string
  followee_id: string
  created_at: string
}

export interface RestDay {
  id: string
  user_id: string
  day_of_week: DayOfWeek
  created_at: string
}

export type WorkoutType = 'lift' | 'cardio'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Workout {
  id: string
  user_id: string
  name: string
  description: string | null
  type: WorkoutType
  is_active: boolean
  default_sets: number | null
  default_reps: number | null
  default_distance: number | null
  default_duration: number | null
  created_at: string
  updated_at: string
}

export interface WorkoutSchedule {
  id: string
  user_id: string
  workout_id: string
  day_of_week: DayOfWeek
  created_at: string
  workout?: Workout
}

export interface WorkoutLog {
  id: string
  user_id: string
  workout_id: string
  sets: number | null
  reps: number | null
  weight: number | null
  distance: number | null
  duration: number | null
  notes: string | null
  photos: string[]
  is_done: boolean
  logged_date: string
  created_at: string
  updated_at: string
  workout?: Workout
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
  workout_id: string
  sets?: number
  reps?: number
  weight?: number
  distance?: number
  duration?: number
  notes?: string
  photos?: string[]
  is_done?: boolean
  logged_date?: string
}

export interface UploadLog {
  id: string
  user_id: string
  file_size_bytes: number
  created_at: string
}

export interface WorkoutInput {
  name: string
  description?: string
  type: WorkoutType
  default_sets?: number
  default_reps?: number
  default_distance?: number
  default_duration?: number
}

export interface StatsOverview {
  total_users: number
  total_logs_today: number
  total_logs_this_week: number
  total_logs_this_month: number
  avg_logs_per_user: number
  top_exercises: { name: string; count: number }[]
}
