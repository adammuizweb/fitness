-- Seed data untuk user az@adammuiz.com
-- Jalankan di Supabase SQL Editor atau via psql
-- Ganti v_user_id dengan UUID user yang dituju

DO $$
DECLARE
  v_user_id UUID := '4fff3466-d2f6-409e-9cee-56ffdce40f84';
  today DATE := CURRENT_DATE;
  day1 DATE := CURRENT_DATE - 2;
  day2 DATE := CURRENT_DATE - 1;
BEGIN
  -- Hapus data lama untuk user ini (hanya jika ingin seed ulang)
  -- DELETE FROM public.workout_logs WHERE user_id = v_user_id;
  -- DELETE FROM public.exercises WHERE user_id = v_user_id;

  -- Exercises
  INSERT INTO public.exercises (user_id, name, description) VALUES
    (v_user_id, 'Dumbbell Bench Press',      'Latihan dada dengan dumbbell 5-7.5kg di atas matras'),
    (v_user_id, 'Dumbbell Bent-over Row',    'Latihan punggung dengan dumbbell 7.5-10kg, membungkuk 45 derajat'),
    (v_user_id, 'Dumbbell Shoulder Press',   'Latihan bahu dengan dumbbell 5kg'),
    (v_user_id, 'Dumbbell Bicep Curl',       'Latihan bicep dengan dumbbell 5kg'),
    (v_user_id, 'Goblet Squat',              'Latihan kaki dengan dumbbell 7.5-10kg dipegang di depan dada'),
    (v_user_id, 'Romanian Deadlift Dumbbell', 'Latihan hamstring dengan dumbbell 7.5kg per tangan'),
    (v_user_id, 'Push-up',                   'Latihan dada dan trisep, lutut boleh di matras'),
    (v_user_id, 'Sit-up',                    'Latihan perut di atas matras, tekuk lutut'),
    (v_user_id, 'Plank',                     'Latihan core statis di atas matras'),
    (v_user_id, 'Jalan Ringan 200m',         'Cardio ringan jalan kaki 200 meter');

  -- Hari 1: Upper Body
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 5,    'Dumbbell 5kg per tangan',      day1 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Dumbbell Bench Press';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 7.5,  'Dumbbell 7.5kg per tangan',     day1 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Dumbbell Bent-over Row';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 5,    'Dumbbell 5kg',                 day1 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Dumbbell Shoulder Press';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 12, 5,    'Dumbbell 5kg',                 day1 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Dumbbell Bicep Curl';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 1, 1,  0,    'Jalan santai 200m',             day1 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Jalan Ringan 200m';

  -- Hari 2: Lower + Core
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 7.5,  'Dumbbell 7.5kg',                day2 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Goblet Squat';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 7.5,  'Dumbbell 7.5kg per tangan',     day2 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Romanian Deadlift Dumbbell';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 15, 0,    'Bodyweight',                    day2 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Sit-up';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 1,  0,    'Tahan 30 detik per set',        day2 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Plank';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 1, 1,  0,    'Jalan santai 200m',             day2 FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Jalan Ringan 200m';

  -- Hari 3: Full Body
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 0,    'Lutut boleh di matras',          today FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Push-up';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 7.5,  'Dumbbell 7.5kg',                today FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Dumbbell Bent-over Row';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 7.5,  'Dumbbell 7.5kg',                today FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Goblet Squat';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 3, 10, 5,    'Dumbbell 5kg',                  today FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Dumbbell Shoulder Press';
  INSERT INTO public.workout_logs (user_id, exercise_id, sets, reps, weight, notes, logged_date)
  SELECT v_user_id, e.id, 1, 1,  0,    'Jalan santai 200m',             today FROM public.exercises e WHERE e.user_id = v_user_id AND e.name = 'Jalan Ringan 200m';

  RAISE NOTICE 'Seed selesai: 10 exercises, 15 workout logs';
END $$;
