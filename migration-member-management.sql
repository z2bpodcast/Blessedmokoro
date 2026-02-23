-- Migration: Add Member Management Fields
-- Run this if you already have an existing Z2B database

-- Step 1: Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS membership_type TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

-- Step 2: Add constraints
ALTER TABLE profiles
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('active', 'suspended', 'deleted'));

ALTER TABLE profiles
ADD CONSTRAINT profiles_membership_type_check 
CHECK (membership_type IN ('free', 'paid'));

-- Step 3: Update existing members to active status
UPDATE profiles
SET status = 'active'
WHERE status IS NULL;

UPDATE profiles
SET membership_type = 'free'
WHERE membership_type IS NULL;

-- Step 4: Calculate existing referral counts
UPDATE profiles p
SET total_referrals = (
  SELECT COUNT(*)
  FROM profiles
  WHERE referred_by = p.referral_code
)
WHERE p.total_referrals = 0 OR p.total_referrals IS NULL;

-- Step 5: Create function to update referral counts (if not exists)
CREATE OR REPLACE FUNCTION public.update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.profiles
    SET total_referrals = (
      SELECT COUNT(*)
      FROM public.profiles
      WHERE referred_by = NEW.referred_by
    )
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_count();

-- Step 7: Update RLS policies to include status checks
-- Drop old policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all content" ON content;

-- Recreate with status checks
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id AND status = 'active');

CREATE POLICY "Active authenticated users can view all content"
  ON content FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.status = 'active'
    )
  );

-- Step 8: Add admin-only policies for member management
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
    OR auth.uid() = id
  );

-- Done! Your database now supports member management
-- Test by running: SELECT email, status, membership_type, total_referrals FROM profiles;
