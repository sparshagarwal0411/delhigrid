-- Add wallet_balance column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0;

-- Update existing users to have wallet_balance equal to their current score (initial migration)
UPDATE public.users SET wallet_balance = score;

-- Update the function to increment wallet_balance along with score
CREATE OR REPLACE FUNCTION public.update_user_score_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update score when status changes to 'verified'
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    UPDATE public.users
    SET 
        score = COALESCE(score, 0) + COALESCE(NEW.points_rewarded, 0),
        wallet_balance = COALESCE(wallet_balance, 0) + COALESCE(NEW.points_rewarded, 0)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
