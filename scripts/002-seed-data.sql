-- Insert demo users with correct credentials
INSERT INTO users (email, name, password_hash, role, company, avatar) VALUES
('admin@editlobby.com', 'Sarah Admin', '$2b$10$dummy.hash.for.demo', 'admin', 'Edit Lobby', '/placeholder.svg?height=40&width=40&text=SA'),
('editor@editlobby.com', 'Mike Editor', '$2b$10$dummy.hash.for.demo', 'employee', 'Edit Lobby', '/placeholder.svg?height=40&width=40&text=ME'),
('client@company.com', 'John Client', '$2b$10$dummy.hash.for.demo', 'client', 'Acme Corp', '/placeholder.svg?height=40&width=40&text=JC'),
('jane@startup.com', 'Jane Smith', '$2b$10$dummy.hash.for.demo', 'client', 'Startup Inc', '/placeholder.svg?height=40&width=40&text=JS'),
('editor2@editlobby.com', 'Lisa Editor', '$2b$10$dummy.hash.for.demo', 'employee', 'Edit Lobby', '/placeholder.svg?height=40&width=40&text=LE')
ON CONFLICT (email) DO NOTHING;

-- Insert demo projects using proper UUID references
INSERT INTO projects (title, description, client_id, assigned_editor_id, status, priority, due_date) 
SELECT 
  'Product Launch Video',
  'Marketing video for new product launch campaign',
  u1.id,
  u2.id,
  'in_progress',
  'high',
  '2024-02-15'::date
FROM users u1, users u2 
WHERE u1.email = 'client@company.com' AND u2.email = 'editor@editlobby.com'

UNION ALL

SELECT 
  'Company Overview',
  'Corporate overview video for website',
  u1.id,
  u2.id,
  'qc_review',
  'medium',
  '2024-02-20'::date
FROM users u1, users u2 
WHERE u1.email = 'jane@startup.com' AND u2.email = 'editor2@editlobby.com'

UNION ALL

SELECT 
  'Training Series',
  'Employee training video series - 5 episodes',
  u1.id,
  u2.id,
  'pending',
  'low',
  '2024-03-01'::date
FROM users u1, users u2 
WHERE u1.email = 'client@company.com' AND u2.email = 'editor@editlobby.com'

UNION ALL

SELECT 
  'Event Highlights',
  'Conference highlights and key moments',
  u1.id,
  u2.id,
  'completed',
  'medium',
  '2024-01-30'::date
FROM users u1, users u2 
WHERE u1.email = 'jane@startup.com' AND u2.email = 'editor2@editlobby.com';

-- Note: videos, comments, and chat_messages tables are not in the current schema
-- These inserts have been removed to prevent errors

-- Insert demo notifications using proper UUID references
INSERT INTO notifications (user_id, title, message, type, is_read, action_url) 
SELECT 
  u.id,
  'Video Ready for Review',
  'Your product launch video is ready for review',
  'project_update',
  false,
  '/projects/1'
FROM users u WHERE u.email = 'client@company.com'

UNION ALL

SELECT 
  u.id,
  'New Comment Added',
  'Mike Editor replied to your comment on Product Demo Raw Footage',
  'info',
  false,
  '/projects/1/videos/1'
FROM users u WHERE u.email = 'client@company.com'

UNION ALL

SELECT 
  u.id,
  'Project Assigned',
  'You have been assigned to Training Series project',
  'project_update',
  true,
  '/projects/3'
FROM users u WHERE u.email = 'editor@editlobby.com'

UNION ALL

SELECT 
  u.id,
  'Video Completed',
  'Your Event Highlights video has been completed',
  'project_update',
  false,
  '/projects/4'
FROM users u WHERE u.email = 'jane@startup.com'

UNION ALL

SELECT 
  u.id,
  'System Maintenance',
  'Scheduled maintenance tonight from 2-4 AM EST',
  'info',
  true,
  null
FROM users u WHERE u.email = 'admin@editlobby.com'

UNION ALL

SELECT 
  u.id,
  'New Client Message',
  'John Client sent you a message about Product Launch Video',
  'info',
  false,
  '/chat/1'
FROM users u WHERE u.email = 'editor@editlobby.com'

UNION ALL

SELECT 
  u.id,
  'Deadline Reminder',
  'Company Overview project deadline is in 3 days',
  'warning',
  false,
  '/projects/2'
FROM users u WHERE u.email = 'editor2@editlobby.com';

-- Insert demo user settings using proper UUID references
INSERT INTO user_settings (user_id, theme, language, timezone, notifications_enabled, email_notifications, push_notifications, comment_notifications, project_update_notifications, billing_notifications, profile_visible, activity_visible, auto_play_videos, preferred_quality) 
SELECT 
  u.id,
  'dark',
  'en',
  'UTC',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  false,
  true,
  'hd'
FROM users u WHERE u.email = 'admin@editlobby.com'

UNION ALL

SELECT 
  u.id,
  'light',
  'en',
  'UTC',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  false,
  true,
  'hd'
FROM users u WHERE u.email = 'editor@editlobby.com'

UNION ALL

SELECT 
  u.id,
  'light',
  'en',
  'UTC',
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  false,
  true,
  'hd'
FROM users u WHERE u.email = 'client@company.com'

UNION ALL

SELECT 
  u.id,
  'light',
  'en',
  'UTC',
  false,
  false,
  false,
  false,
  true,
  false,
  true,
  false,
  true,
  'hd'
FROM users u WHERE u.email = 'jane@startup.com'

UNION ALL

SELECT 
  u.id,
  'dark',
  'en',
  'UTC',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  false,
  true,
  'hd'
FROM users u WHERE u.email = 'editor2@editlobby.com'

ON CONFLICT (user_id) DO NOTHING;
