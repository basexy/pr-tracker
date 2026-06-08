-- ═══════════════════════════════════════════════════════════════
--  Workout Tracker Migration
--  Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ── New tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id TEXT REFERENCES exercises(id),
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  default_kg REAL DEFAULT 0,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS day_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  is_rest BOOLEAN DEFAULT FALSE,
  UNIQUE(user_name, date)
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  plan_id UUID REFERENCES workout_plans(id),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_name, date)
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  sets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, order_index)
);

-- ── Enable RLS (same pattern as existing tables) ─────────────────

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON workout_plans FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON plan_exercises FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON day_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON workout_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON exercise_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── Seed: default exercises ──────────────────────────────────────
-- Only inserts if ID doesn't already exist

INSERT INTO exercises (id, name, tag, unit) VALUES
  ('panca-piana',       'Panca Piana',           'petto',     'kg'),
  ('panca-inclinata',   'Panca Inclinata',        'petto',     'kg'),
  ('croci-cavi',        'Croci ai Cavi',          'petto',     'kg'),
  ('dip',               'Dip alle Parallele',     'petto',     'reps'),
  ('trazioni',          'Trazioni',               'dorso',     'reps'),
  ('rematore',          'Rematore Bilanciere',    'dorso',     'kg'),
  ('lat-machine',       'Lat Machine',            'dorso',     'kg'),
  ('face-pull',         'Face Pull',              'dorso',     'kg'),
  ('stacchi',           'Stacchi da Terra',       'dorso',     'kg'),
  ('squat',             'Squat',                  'gambe',     'kg'),
  ('leg-press',         'Leg Press',              'gambe',     'kg'),
  ('leg-extension',     'Leg Extension',          'gambe',     'kg'),
  ('leg-curl',          'Leg Curl',               'gambe',     'kg'),
  ('calf-raise',        'Calf Raise',             'gambe',     'kg'),
  ('military-press',    'Military Press',         'spalle',    'kg'),
  ('alzate-laterali',   'Alzate Laterali',        'spalle',    'kg'),
  ('alzate-frontali',   'Alzate Frontali',        'spalle',    'kg'),
  ('curl-bilanciere',   'Curl Bilanciere',        'bicipiti',  'kg'),
  ('hammer-curl',       'Hammer Curl',            'bicipiti',  'kg'),
  ('french-press',      'French Press',           'tricipiti', 'kg'),
  ('push-down',         'Push Down ai Cavi',      'tricipiti', 'kg')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: default workout plans ──────────────────────────────────

INSERT INTO workout_plans (id, name, muscle_group) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Petto',     'petto'),
  ('10000000-0000-0000-0000-000000000002', 'Dorso',     'dorso'),
  ('10000000-0000-0000-0000-000000000003', 'Gambe',     'gambe'),
  ('10000000-0000-0000-0000-000000000004', 'Spalle',    'spalle'),
  ('10000000-0000-0000-0000-000000000005', 'Braccia',   'braccia'),
  ('10000000-0000-0000-0000-000000000006', 'Full Body', 'full_body')
ON CONFLICT (id) DO NOTHING;

-- Petto
INSERT INTO plan_exercises (plan_id, exercise_id, default_sets, default_reps, default_kg, order_index) VALUES
  ('10000000-0000-0000-0000-000000000001', 'panca-piana',     4,  8, 80, 0),
  ('10000000-0000-0000-0000-000000000001', 'panca-inclinata', 3, 10, 60, 1),
  ('10000000-0000-0000-0000-000000000001', 'croci-cavi',      3, 12, 15, 2),
  ('10000000-0000-0000-0000-000000000001', 'dip',             3, 12,  0, 3);

-- Dorso
INSERT INTO plan_exercises (plan_id, exercise_id, default_sets, default_reps, default_kg, order_index) VALUES
  ('10000000-0000-0000-0000-000000000002', 'trazioni',   4, 8,  0, 0),
  ('10000000-0000-0000-0000-000000000002', 'rematore',   4, 8, 80, 1),
  ('10000000-0000-0000-0000-000000000002', 'lat-machine',3,10, 60, 2),
  ('10000000-0000-0000-0000-000000000002', 'face-pull',  3,15, 20, 3);

-- Gambe
INSERT INTO plan_exercises (plan_id, exercise_id, default_sets, default_reps, default_kg, order_index) VALUES
  ('10000000-0000-0000-0000-000000000003', 'squat',         4,  8,100, 0),
  ('10000000-0000-0000-0000-000000000003', 'leg-press',     3, 10,150, 1),
  ('10000000-0000-0000-0000-000000000003', 'leg-extension', 3, 12, 50, 2),
  ('10000000-0000-0000-0000-000000000003', 'leg-curl',      3, 12, 40, 3),
  ('10000000-0000-0000-0000-000000000003', 'calf-raise',    4, 15, 60, 4);

-- Spalle
INSERT INTO plan_exercises (plan_id, exercise_id, default_sets, default_reps, default_kg, order_index) VALUES
  ('10000000-0000-0000-0000-000000000004', 'military-press',  4,  8, 60, 0),
  ('10000000-0000-0000-0000-000000000004', 'alzate-laterali', 3, 15, 10, 1),
  ('10000000-0000-0000-0000-000000000004', 'alzate-frontali', 3, 15, 10, 2);

-- Braccia
INSERT INTO plan_exercises (plan_id, exercise_id, default_sets, default_reps, default_kg, order_index) VALUES
  ('10000000-0000-0000-0000-000000000005', 'curl-bilanciere', 4, 10, 30, 0),
  ('10000000-0000-0000-0000-000000000005', 'hammer-curl',     3, 12, 14, 1),
  ('10000000-0000-0000-0000-000000000005', 'french-press',    4, 10, 20, 2),
  ('10000000-0000-0000-0000-000000000005', 'push-down',       3, 15, 25, 3);

-- Full Body
INSERT INTO plan_exercises (plan_id, exercise_id, default_sets, default_reps, default_kg, order_index) VALUES
  ('10000000-0000-0000-0000-000000000006', 'squat',         3,  8, 80, 0),
  ('10000000-0000-0000-0000-000000000006', 'stacchi',       3,  8, 90, 1),
  ('10000000-0000-0000-0000-000000000006', 'panca-piana',   3,  8, 70, 2),
  ('10000000-0000-0000-0000-000000000006', 'trazioni',      3,  8,  0, 3),
  ('10000000-0000-0000-0000-000000000006', 'military-press',3, 10, 50, 4);
