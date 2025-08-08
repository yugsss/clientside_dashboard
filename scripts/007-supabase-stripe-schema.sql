-- Enable the Stripe extension
CREATE EXTENSION IF NOT EXISTS "stripe" WITH SCHEMA "extensions";

-- Create customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  address JSONB,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id TEXT PRIMARY KEY,
  active BOOLEAN DEFAULT TRUE,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES stripe_products(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  currency TEXT,
  unit_amount INTEGER,
  type TEXT CHECK (type IN ('one_time', 'recurring')),
  interval TEXT CHECK (interval IN ('day', 'week', 'month', 'year')),
  interval_count INTEGER DEFAULT 1,
  metadata JSONB,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES stripe_customers(id) ON DELETE CASCADE,
  status TEXT,
  price_id TEXT REFERENCES stripe_prices(id),
  quantity INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment intents table
CREATE TABLE IF NOT EXISTS stripe_payment_intents (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES stripe_customers(id),
  amount INTEGER,
  currency TEXT,
  status TEXT,
  metadata JSONB,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON stripe_prices(product_id);

-- Enable Row Level Security
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_intents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own customer data" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active products" ON stripe_products
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Anyone can view active prices" ON stripe_prices
  FOR SELECT USING (active = TRUE);
