-- Update complaints table for better tracking and transparency
ALTER TABLE public.complaints 
  ADD COLUMN IF NOT EXISTS admin_feedback TEXT,
  ADD COLUMN IF NOT EXISTS points_rewarded INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;

-- Update status constraint
-- First drop existing constraint if possible (we don't know the name, usually it's complaints_status_check)
-- We'll just add a new one and try to be safe.
-- In Supabase, we can use a more robust approach.

DO $$ 
BEGIN
  -- Drop existing status constraint if it exists
  ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
  
  -- Add new status constraint
  ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check 
    CHECK (status IN ('received', 'reported', 'working', 'solved', 'pending', 'in_progress', 'resolved'));
END $$;

-- Function to automatically record status changes in the timeline
CREATE OR REPLACE FUNCTION public.handle_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS NULL OR OLD.status <> NEW.status) THEN
    NEW.timeline = NEW.timeline || jsonb_build_object(
      'status', NEW.status,
      'timestamp', TIMEZONE('utc'::text, NOW()),
      'updated_by', auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for status change
DROP TRIGGER IF EXISTS on_complaint_status_change ON public.complaints;
CREATE TRIGGER on_complaint_status_change
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_complaint_status_change();

-- Also ensure first entry in timeline on creation
CREATE OR REPLACE FUNCTION public.handle_complaint_initial_timeline()
RETURNS TRIGGER AS $$
BEGIN
  NEW.timeline = jsonb_build_array(
    jsonb_build_object(
      'status', NEW.status,
      'timestamp', TIMEZONE('utc'::text, NOW()),
      'updated_by', NEW.user_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_complaint_created ON public.complaints;
CREATE TRIGGER on_complaint_created
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_complaint_initial_timeline();

-- Policy for admins to update complaints (already exists but ensuring it works for the new fields)
-- The existing policy is:
-- CREATE POLICY "Admins can update complaints" ON public.complaints
--   FOR UPDATE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.users
--       WHERE users.id = auth.uid() AND users.role = 'admin'
--     )
--   );
-- This should cover the new fields.

-- Refresh the view/cache if needed
COMMENT ON COLUMN public.complaints.timeline IS 'History of status changes for transparency';
