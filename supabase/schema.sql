-- =============================================
-- LOYALTY PLATFORM - DATABASE SCHEMA
-- Multi-tenant: cada "business" es un cliente
-- =============================================

-- Businesses (los negocios que compran el servicio)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- eureka-burgers, sede-cafe, etc.
  logo_url TEXT,
  primary_color TEXT DEFAULT '#110DDE',
  secondary_color TEXT DEFAULT '#EC4E20',
  accent_color TEXT DEFAULT '#F6AE2D',
  stamp_goal INTEGER DEFAULT 10, -- sellos para canjear
  reward_description TEXT DEFAULT 'Burger gratis',
  tagline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (usuarios finales que tienen tarjetas)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  device_type TEXT, -- 'apple' | 'google' | 'web'
  pass_serial TEXT UNIQUE, -- ID del pass en Apple/Google Wallet
  qr_code TEXT UNIQUE NOT NULL, -- QR único para escanear
  stamps INTEGER DEFAULT 0,
  total_stamps INTEGER DEFAULT 0, -- histórico total
  rewards_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_stamp_at TIMESTAMPTZ
);

-- Stamps (log de cada sellada)
CREATE TABLE stamp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  staff_id UUID, -- quien lo selló
  stamps_given INTEGER DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards redeemed (log de canjes)
CREATE TABLE reward_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  staff_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff (empleados de cada negocio)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID, -- supabase auth user
  name TEXT NOT NULL,
  role TEXT DEFAULT 'staff', -- 'admin' | 'staff'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar Eureka Burgers como primer negocio
INSERT INTO businesses (
  name, slug, primary_color, secondary_color, accent_color,
  stamp_goal, reward_description, tagline
) VALUES (
  'Eureka Burgers',
  'eureka-burgers',
  '#110DDE',
  '#EC4E20',
  '#F6AE2D',
  9,
  '¡Tu burger es gratis!',
  'BURGERS ARE ALWAYS A GOOD IDEA'
);

-- Índices para performance
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_qr ON customers(qr_code);
CREATE INDEX idx_customers_pass_serial ON customers(pass_serial);
CREATE INDEX idx_stamps_customer ON stamp_events(customer_id);
CREATE INDEX idx_stamps_business ON stamp_events(business_id);
