-- Step 1: Drop tasks table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Step 1b: Create tasks table for predefined tasks
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('waste', 'tree', 'water', 'awareness', 'air', 'custom')),
  points INTEGER NOT NULL DEFAULT 0,
  is_custom BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Add score column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'score'
  ) THEN
    ALTER TABLE public.users ADD COLUMN score INTEGER DEFAULT 0;
  END IF;
END $$;

-- Step 3: Drop user_tasks table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS public.user_tasks CASCADE;

-- Step 3b: Create user_tasks table to track user task assignments and completions
CREATE TABLE public.user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'rejected')),
  image_url TEXT,
  points_rewarded INTEGER DEFAULT 0,
  submission_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id),
  week_start_date DATE NOT NULL DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE
);

-- Step 4: Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Admins can verify tasks" ON public.user_tasks;

-- Step 6: RLS Policies for tasks table (read-only for all authenticated users)
CREATE POLICY "Tasks are viewable by authenticated users" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Step 7: RLS Policies for user_tasks table
-- Users can view their own tasks
CREATE POLICY "Users can view own tasks" ON public.user_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks" ON public.user_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks (for submission)
CREATE POLICY "Users can update own tasks" ON public.user_tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks" ON public.user_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Admins can update all tasks (for verification)
CREATE POLICY "Admins can verify tasks" ON public.user_tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_tasks_user_id_idx ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS user_tasks_task_id_idx ON public.user_tasks(task_id);
CREATE INDEX IF NOT EXISTS user_tasks_status_idx ON public.user_tasks(status);
CREATE INDEX IF NOT EXISTS user_tasks_week_start_date_idx ON public.user_tasks(week_start_date);
CREATE INDEX IF NOT EXISTS tasks_category_idx ON public.tasks(category);
CREATE INDEX IF NOT EXISTS tasks_is_active_idx ON public.tasks(is_active);

-- Step 9: Create function to update updated_at timestamp for tasks
CREATE OR REPLACE FUNCTION public.handle_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Drop trigger if exists, then create
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_tasks_updated_at();

-- Step 11: Create function to update user score when task is verified
CREATE OR REPLACE FUNCTION public.update_user_score_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update score when status changes to 'verified'
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    UPDATE public.users
    SET score = COALESCE(score, 0) + COALESCE(NEW.points_rewarded, 0)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_score_on_verification ON public.user_tasks;
CREATE TRIGGER update_score_on_verification
  AFTER UPDATE ON public.user_tasks
  FOR EACH ROW
  WHEN (NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified'))
  EXECUTE FUNCTION public.update_user_score_on_verification();

-- Step 13: Insert predefined tasks
INSERT INTO public.tasks (id, title, description, category, points, is_custom, is_active) VALUES
  ('sapling-001', 'Plant a Sapling', 'Plant a tree or shrub in your locality and nurture it', 'tree', 50, FALSE, TRUE),
  ('waste-001', 'Waste Segregation', 'Properly segregate waste (dry/wet) for 7 consecutive days', 'waste', 30, FALSE, TRUE),
  ('carpool-001', 'Carpool to Work', 'Reduce air pollution by carpooling with colleagues', 'air', 20, FALSE, TRUE),
  ('burning-001', 'Report Open Burning', 'Report illegal open waste burning in your area', 'air', 40, FALSE, TRUE),
  ('cleanup-001', 'Community Clean-up Drive', 'Participate in or organize a local clean-up event', 'waste', 60, FALSE, TRUE),
  ('water-001', 'Water Conservation', 'Implement water-saving practices for 7 days (rainwater harvesting, reuse)', 'water', 35, FALSE, TRUE),
  ('awareness-001', 'Spread Awareness', 'Organize or participate in an environmental awareness session', 'awareness', 45, FALSE, TRUE),
  ('waste-002', 'Composting Setup', 'Set up a composting system at home', 'waste', 40, FALSE, TRUE),
  ('tree-002', 'Tree Care', 'Adopt and care for a public tree in your area for a month', 'tree', 55, FALSE, TRUE),
  ('air-002', 'Use Public Transport', 'Use public transport or cycle instead of private vehicle for a week', 'air', 25, FALSE, TRUE),
  ('water-002', 'Fix Leaks', 'Identify and fix water leaks in your home/neighborhood', 'water', 30, FALSE, TRUE),
  ('awareness-002', 'Social Media Campaign', 'Create and share environmental awareness content on social media', 'awareness', 20, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Step 14: Create storage bucket for task verification images (if not exists)
-- Note: This requires storage extension to be enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'task-verifications'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('task-verifications', 'task-verifications', TRUE);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If storage extension is not available, just skip this
    NULL;
END $$;

-- Step 15: Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload task verification images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own task verification images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all task verification images" ON storage.objects;

-- Step 16: Storage policies for task-verifications bucket
-- Note: These will fail silently if storage is not enabled
DO $$
BEGIN
  CREATE POLICY "Users can upload task verification images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'task-verifications' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can view their own task verification images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-verifications' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
  );

  CREATE POLICY "Admins can view all task verification images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-verifications' AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If storage policies fail, log but don't stop migration
    RAISE NOTICE 'Storage policies could not be created. Storage may not be enabled.';
END $$;
