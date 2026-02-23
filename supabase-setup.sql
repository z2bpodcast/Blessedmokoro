-- Z2B Table Banquet Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  membership_type TEXT NOT NULL DEFAULT 'free' CHECK (membership_type IN ('free', 'paid')),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table
CREATE TABLE content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'pdf')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral clicks tracking table
CREATE TABLE referral_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  content_id UUID REFERENCES content(id),
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_content_is_public ON content(is_public);
CREATE INDEX idx_content_created_at ON content(created_at DESC);
CREATE INDEX idx_referral_clicks_referrer ON referral_clicks(referrer_id);
CREATE INDEX idx_referral_clicks_converted ON referral_clicks(converted);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Content policies
CREATE POLICY "Public content is viewable by everyone"
  ON content FOR SELECT
  USING (is_public = true);

CREATE POLICY "Authenticated users can view all content"
  ON content FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert content"
  ON content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update content"
  ON content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete content"
  ON content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Referral clicks policies
CREATE POLICY "Users can view their own referral clicks"
  ON referral_clicks FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "Anyone can insert referral clicks"
  ON referral_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update referral clicks for conversion tracking"
  ON referral_clicks FOR UPDATE
  USING (true);

-- Function to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update referral counts
CREATE OR REPLACE FUNCTION public.update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_referrals count for the referrer
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

-- Trigger to update referral counts
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_count();

-- Function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last login (Note: This would need to be called from your app)
-- You can call this manually when users log in

-- Create your first admin user (UPDATE THIS WITH YOUR EMAIL)
-- Run this AFTER you've signed up with your account
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

-- Sample content (optional - for testing)
-- INSERT INTO content (title, description, type, file_url, is_public, created_by)
-- VALUES (
--   'Welcome to Z2B Table Banquet',
--   'An introduction to our premium learning platform',
--   'video',
--   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
--   true,
--   (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)
-- );
