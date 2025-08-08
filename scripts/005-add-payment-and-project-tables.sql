-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  signup_token TEXT UNIQUE NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token_used BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add plan-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'basic';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Basic Plan';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_price INTEGER DEFAULT 45;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'per-video';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_features TEXT[] DEFAULT ARRAY['1 video edit', '48-hour turnaround', '2 revisions'];
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_projects INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_revisions INTEGER DEFAULT 2;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_since TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add project management columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_drive_link TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS frameio_project_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS max_revisions INTEGER DEFAULT 2;

-- Create project_assignments table
CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  role_type TEXT NOT NULL CHECK (role_type IN ('editor', 'qc')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create editor_tasks table
CREATE TABLE IF NOT EXISTS editor_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_records_token ON payment_records(signup_token);
CREATE INDEX IF NOT EXISTS idx_payment_records_email ON payment_records(customer_email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_editor_tasks_editor ON editor_tasks(editor_id);
