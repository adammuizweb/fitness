import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
})

export const workoutSchema = z.object({
  name: z.string().min(1, 'Nama workout wajib diisi'),
  description: z.string().optional(),
  type: z.enum(['lift', 'cardio']),
  default_sets: z.coerce.number().int().positive().optional(),
  default_reps: z.coerce.number().int().positive().optional(),
  default_distance: z.coerce.number().min(0).optional(),
  default_duration: z.coerce.number().int().positive().optional(),
})

export const workoutLogSchema = z.object({
  workout_id: z.string().uuid('Pilih workout'),
  sets: z.coerce.number().int().positive().optional(),
  reps: z.coerce.number().int().positive().optional(),
  weight: z.coerce.number().min(0).optional(),
  distance: z.coerce.number().min(0).optional(),
  duration: z.coerce.number().int().positive().optional(),
  is_done: z.boolean().optional(),
  notes: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type WorkoutInput = z.infer<typeof workoutSchema>
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>
