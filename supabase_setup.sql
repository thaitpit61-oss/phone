-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create phones table
CREATE TABLE IF NOT EXISTS phones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'sold')) DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create phone_images table
CREATE TABLE IF NOT EXISTS phone_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_id UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_phones_updated_at ON phones;
CREATE TRIGGER update_phones_updated_at
    BEFORE UPDATE ON phones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_phone_images_phone_id ON phone_images(phone_id);
CREATE INDEX IF NOT EXISTS idx_phones_brand ON phones(brand);
CREATE INDEX IF NOT EXISTS idx_phones_status ON phones(status);

-- 6. Sample Data
-- Clear existing data to avoid conflicts during setup
TRUNCATE phones CASCADE;

INSERT INTO phones (id, name, brand, price, status, description)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'iPhone 15 Pro Max', 'Apple', 34990000, 'available', 'Chip A17 Pro mạnh mẽ, camera 48MP, khung viền Titan.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Samsung Galaxy S24 Ultra', 'Samsung', 29990000, 'available', 'Bút S Pen tích hợp, camera 200MP, màn hình 120Hz.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Google Pixel 8 Pro', 'Google', 22500000, 'sold', 'Camera AI đỉnh cao, trải nghiệm Android thuần khiết.');

-- Sample images (using placeholders for now)
INSERT INTO phone_images (phone_id, storage_path, public_url, is_cover, sort_order)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'samples/iphone15_1.jpg', 'https://picsum.photos/seed/iphone15/800/600', true, 0),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'samples/iphone15_2.jpg', 'https://picsum.photos/seed/iphone15_2/800/600', false, 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'samples/s24_1.jpg', 'https://picsum.photos/seed/s24/800/600', true, 0),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'samples/pixel8_1.jpg', 'https://picsum.photos/seed/pixel8/800/600', true, 0);

-- 7. Storage Setup Instructions
-- Create bucket 'phone-images' in Supabase Dashboard -> Storage
-- Set bucket to 'Public'
-- Run these policies in SQL Editor:
/*
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'phone-images');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'phone-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'phone-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING (bucket_id = 'phone-images' AND auth.role() = 'authenticated');
*/
