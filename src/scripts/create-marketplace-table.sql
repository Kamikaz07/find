-- Create marketplace table
CREATE TABLE marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON marketplace_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all marketplace items"
    ON marketplace_items FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own marketplace items"
    ON marketplace_items FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own marketplace items"
    ON marketplace_items FOR UPDATE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own marketplace items"
    ON marketplace_items FOR DELETE
    USING (auth.uid()::text = user_id::text); 