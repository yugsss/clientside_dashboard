-- Drop existing payment_records table if it exists
DROP TABLE IF EXISTS payment_records CASCADE;

-- Create payment_records table with proper structure
CREATE TABLE payment_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    product_id TEXT, -- Stripe product ID
    amount INTEGER NOT NULL, -- Amount in cents
    signup_token TEXT UNIQUE NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    token_used BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_payment_records_signup_token ON payment_records(signup_token);
CREATE INDEX idx_payment_records_customer_email ON payment_records(customer_email);
CREATE INDEX idx_payment_records_stripe_session ON payment_records(stripe_session_id);
CREATE INDEX idx_payment_records_token_used ON payment_records(token_used);
CREATE INDEX idx_payment_records_status ON payment_records(status);
CREATE INDEX idx_payment_records_created_at ON payment_records(created_at);

-- Enable RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service role can manage payment records" ON payment_records
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view their own payment records
CREATE POLICY "Users can view their own payment records" ON payment_records
    FOR SELECT USING (auth.jwt() ->> 'email' = customer_email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for payment_records
CREATE TRIGGER update_payment_records_updated_at
    BEFORE UPDATE ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update users table to include plan details
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'basic';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Basic Plan';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'per-video';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_features TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_projects INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_revisions INTEGER DEFAULT 2;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_since TEXT;

-- Grant necessary permissions
GRANT ALL ON payment_records TO service_role;
GRANT ALL ON users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Insert test data to verify table structure (optional - remove in production)
INSERT INTO payment_records (
    stripe_session_id,
    customer_email,
    plan_id,
    product_id,
    amount,
    signup_token,
    token_expires_at,
    status
) VALUES (
    'cs_test_sample_' || gen_random_uuid()::text,
    'test@example.com',
    'basic',
    'prod_SoYjLkZloARhuO',
    4500,
    'test_token_' || gen_random_uuid()::text,
    NOW() + INTERVAL '24 hours',
    'completed'
) ON CONFLICT DO NOTHING;

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_records' 
ORDER BY ordinal_position;
