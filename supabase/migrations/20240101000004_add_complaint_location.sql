-- Add location_text column for user-entered location
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS location_text TEXT;

-- Allow anyone to read complaints (for ward profile display - public transparency)
DROP POLICY IF EXISTS "Citizens can view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
CREATE POLICY "Anyone can view complaints" ON public.complaints
  FOR SELECT USING (true);
