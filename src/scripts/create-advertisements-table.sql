-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  publisher TEXT NOT NULL,
  image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Allow users to read public advertisements
CREATE POLICY "Anyone can read public advertisements" ON advertisements
  FOR SELECT USING (is_public = TRUE);

-- Allow users to read their own advertisements
CREATE POLICY "Users can read own advertisements" ON advertisements
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own advertisements
CREATE POLICY "Users can insert own advertisements" ON advertisements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own advertisements
CREATE POLICY "Users can update own advertisements" ON advertisements
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own advertisements
CREATE POLICY "Users can delete own advertisements" ON advertisements
  FOR DELETE USING (auth.uid() = user_id);