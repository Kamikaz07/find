-- Insert a test user
INSERT INTO users (id, email, password, receive_updates)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', -- This is a dummy hashed password
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert a test advertisement (formerly announcement)
INSERT INTO advertisements (
    id,
    title,
    description,
    location,
    image_url,
    user_id,
    publisher,
    is_public
)
VALUES (
    '00000000-0000-0000-0000-000000000002', -- Consistent ID
    'Lost Dog in Central Park',
    'Small brown dog, answers to the name Max. Last seen near the fountain.',
    'Central Park, New York',
    'https://example.com/dog.jpg',
    '00000000-0000-0000-0000-000000000001',
    'Central Park Animal Welfare', -- Example publisher
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Insert a test marketplace item
INSERT INTO marketplace_items (
    id,
    user_id,
    title,
    description,
    price,
    location,
    type,
    image_url
)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Vintage Camera',
    'Beautiful vintage camera in excellent condition. Perfect for collectors.',
    199.99,
    'Brooklyn, New York',
    'sale',
    'https://example.com/camera.jpg'
) ON CONFLICT (id) DO NOTHING;