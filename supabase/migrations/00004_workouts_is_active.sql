-- Soft delete: nonaktifkan workout tanpa menghapus history log
ALTER TABLE public.workouts ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
