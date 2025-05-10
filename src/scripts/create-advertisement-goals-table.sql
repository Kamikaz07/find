-- Create advertisement_goals table
CREATE TABLE IF NOT EXISTS advertisement_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertisement_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'donation' or 'delivery'
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER update_advertisement_goals_updated_at
  BEFORE UPDATE ON advertisement_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE advertisement_goals ENABLE ROW LEVEL SECURITY;

-- Allow users to read public advertisement goals
CREATE POLICY "Anyone can read advertisement goals" ON advertisement_goals
  FOR SELECT USING (true);

-- Allow users to insert their own advertisement goals
CREATE POLICY "Users can insert own advertisement goals" ON advertisement_goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM advertisements a 
      WHERE a.id = advertisement_id AND a.user_id = auth.uid()
    )
  );

-- Allow users to update their own advertisement goals
CREATE POLICY "Users can update own advertisement goals" ON advertisement_goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM advertisements a 
      WHERE a.id = advertisement_id AND a.user_id = auth.uid()
    )
  );

-- Allow users to delete their own advertisement goals
CREATE POLICY "Users can delete own advertisement goals" ON advertisement_goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM advertisements a 
      WHERE a.id = advertisement_id AND a.user_id = auth.uid()
    )
  );