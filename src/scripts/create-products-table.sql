-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  publisher TEXT NOT NULL,
  image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow users to read public products
CREATE POLICY "Anyone can read public products" ON products
  FOR SELECT USING (is_public = TRUE);

-- Allow users to read their own products
CREATE POLICY "Users can read own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own products
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own products
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own products
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);