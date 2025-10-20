-- Lead Generation Tool - Supabase Schema
-- Run this in your Supabase SQL editor

-- Create dealers table
CREATE TABLE dealers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create officers table
CREATE TABLE officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  officer_id UUID REFERENCES officers(id) ON DELETE CASCADE,
  area_of_activity TEXT NOT NULL,
  ward TEXT NOT NULL,
  gps_latitude DECIMAL,
  gps_longitude DECIMAL,
  gps_accuracy DECIMAL,
  lead_name TEXT NOT NULL,
  phone_contact TEXT NOT NULL,
  residence TEXT NOT NULL,
  interested_phone_model TEXT NOT NULL,
  next_contact_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_officers_dealer_id ON officers(dealer_id);
CREATE INDEX idx_leads_officer_id ON leads(officer_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Insert sample dealer (for testing)
INSERT INTO dealers (name, email, phone, company) VALUES 
('Fredy Dealers', 'fredysabuni@gmail.com', '+255714276111', 'Mbezi Ltd');

-- Insert sample officers (for testing)
INSERT INTO officers (name, phone, dealer_id) 
SELECT 'G-Officer', '+255714276444', id FROM dealers WHERE phone = '+255714276111';

-- Enable Row Level Security (RLS)
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later)
CREATE POLICY "Allow all operations on dealers" ON dealers FOR ALL USING (true);
CREATE POLICY "Allow all operations on officers" ON officers FOR ALL USING (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true);