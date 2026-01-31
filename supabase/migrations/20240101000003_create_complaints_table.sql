-- Complaints table for citizen-reported issues (when they're unhappy with AI suggestion)
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ward_number INTEGER NOT NULL CHECK (ward_number >= 1 AND ward_number <= 250),
  description TEXT NOT NULL,
  photo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('air', 'water', 'noise', 'transport', 'soil', 'land')),
  ai_suggestion TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Citizens can insert their own complaints
CREATE POLICY "Citizens can insert own complaints" ON public.complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Citizens can view their own complaints
CREATE POLICY "Citizens can view own complaints" ON public.complaints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all complaints
CREATE POLICY "Admins can view all complaints" ON public.complaints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update complaint status
CREATE POLICY "Admins can update complaints" ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS complaints_user_id_idx ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS complaints_ward_number_idx ON public.complaints(ward_number);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON public.complaints(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_complaints_updated_at ON public.complaints;
CREATE TRIGGER set_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Storage bucket for complaint photos (run via Dashboard or add to migrations if supported)
-- Users will upload to 'complaint-photos' bucket
