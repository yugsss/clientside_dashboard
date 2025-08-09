-- Add editor tasks table
CREATE TABLE IF NOT EXISTS editor_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add project assignments table
CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
    role_type TEXT NOT NULL CHECK (role_type IN ('editor', 'qc')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Update user_settings table with all required fields
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS comment_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS project_update_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS billing_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS activity_visible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active_projects INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_editor_tasks_editor_id ON editor_tasks(editor_id);
CREATE INDEX IF NOT EXISTS idx_editor_tasks_project_id ON editor_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_editor_tasks_status ON editor_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_assigned_to ON project_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_editor_tasks_updated_at ON editor_tasks;
CREATE TRIGGER update_editor_tasks_updated_at 
    BEFORE UPDATE ON editor_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user active projects count
CREATE OR REPLACE FUNCTION update_user_active_projects()
RETURNS TRIGGER AS $$
BEGIN
    -- Update editor's active project count
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.assigned_editor_id IS NOT NULL THEN
            UPDATE users 
            SET active_projects = (
                SELECT COUNT(*) 
                FROM projects 
                WHERE assigned_editor_id = NEW.assigned_editor_id 
                AND status IN ('assigned', 'in_progress', 'qc_review')
            )
            WHERE id = NEW.assigned_editor_id;
        END IF;
        
        -- Update QC's active project count
        IF NEW.assigned_qc_id IS NOT NULL THEN
            UPDATE users 
            SET active_projects = (
                SELECT COUNT(*) 
                FROM projects 
                WHERE assigned_qc_id = NEW.assigned_qc_id 
                AND status IN ('qc_review', 'client_review')
            )
            WHERE id = NEW.assigned_qc_id;
        END IF;
    END IF;
    
    -- Handle deletions and updates that change assignments
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        IF OLD.assigned_editor_id IS NOT NULL THEN
            UPDATE users 
            SET active_projects = (
                SELECT COUNT(*) 
                FROM projects 
                WHERE assigned_editor_id = OLD.assigned_editor_id 
                AND status IN ('assigned', 'in_progress', 'qc_review')
            )
            WHERE id = OLD.assigned_editor_id;
        END IF;
        
        IF OLD.assigned_qc_id IS NOT NULL THEN
            UPDATE users 
            SET active_projects = (
                SELECT COUNT(*) 
                FROM projects 
                WHERE assigned_qc_id = OLD.assigned_qc_id 
                AND status IN ('qc_review', 'client_review')
            )
            WHERE id = OLD.assigned_qc_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply trigger to projects table
DROP TRIGGER IF EXISTS update_user_active_projects_trigger ON projects;
CREATE TRIGGER update_user_active_projects_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_user_active_projects();
