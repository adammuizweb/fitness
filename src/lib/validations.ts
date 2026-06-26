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

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Nama exercise wajib diisi'),
  description: z.string().optional(),
})

export const workoutLogSchema = z.object({
  exercise_id: z.string().uuid('Pilih exercise'),
  sets: z.coerce.number().int().positive('Sets harus lebih dari 0'),
  reps: z.coerce.number().int().positive('Reps harus lebih dari 0'),
  weight: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ExerciseInput = z.infer<typeof exerciseSchema>
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>
