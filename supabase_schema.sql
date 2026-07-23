-- FoodLink AI – Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS ngos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOLUNTEERS
-- ============================================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  vehicle_type VARCHAR(50) DEFAULT 'bicycle',
  availability BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DONATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  food_name VARCHAR(255) NOT NULL,
  description TEXT,
  ai_description TEXT,
  shelf_life_guidance TEXT,
  quantity VARCHAR(100),
  servings INTEGER DEFAULT 0,
  food_type VARCHAR(50),
  cooked_time TIMESTAMPTZ,
  expiry_time TIMESTAMPTZ,
  pickup_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'processing', 'pending', 'notified', 'accepted',
    'volunteer_assigned', 'picked_up', 'completed', 'expired'
  )),
  notified_ngo_id UUID REFERENCES ngos(id),
  accepted_ngo_id UUID REFERENCES ngos(id),
  assigned_volunteer_id UUID REFERENCES volunteers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOLUNTEER ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id),
  ngo_id UUID REFERENCES ngos(id),
  otp VARCHAR(10),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'accepted', 'picked_up', 'delivered', 'rejected'
  ))
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_type VARCHAR(20) CHECK (recipient_type IN ('restaurant', 'ngo', 'volunteer')),
  recipient_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  certificate_id VARCHAR(100) UNIQUE,
  certificate_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_donations_restaurant_id ON donations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_volunteer ON volunteer_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_donation ON volunteer_assignments(donation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================================
-- ROW LEVEL SECURITY (Enable for all tables)
-- ============================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service key)
-- Frontend uses anon key for auth only; API calls go through backend

-- Public read for donations (NGOs need to browse)
CREATE POLICY "Public donations read" ON donations
  FOR SELECT USING (true);

-- Restaurants can insert donations
CREATE POLICY "Restaurants insert donations" ON donations
  FOR INSERT WITH CHECK (auth.uid() = restaurant_id);

-- Allow reading own notifications
CREATE POLICY "Own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

-- Public read for restaurants, ngos, volunteers (for map display)
CREATE POLICY "Public restaurants read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public ngos read" ON ngos FOR SELECT USING (true);
CREATE POLICY "Public volunteers read" ON volunteers FOR SELECT USING (true);
