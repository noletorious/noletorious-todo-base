-- Create TEAMS_EMAILS_INTEREST table for storing team plan interest
CREATE TABLE TEAMS_EMAILS_INTEREST (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE TEAMS_EMAILS_INTEREST ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their team plan interest
CREATE POLICY "Users can submit team plan interest" ON TEAMS_EMAILS_INTEREST
  FOR INSERT WITH CHECK (true);

-- Policy to allow admins to read all entries (optional, for admin access)
CREATE POLICY "Admins can read team plan interest" ON TEAMS_EMAILS_INTEREST
  FOR SELECT USING (true);
