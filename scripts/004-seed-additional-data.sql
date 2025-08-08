-- Insert sample editor tasks
INSERT INTO editor_tasks (project_id, editor_id, title, description, status, priority, due_date) VALUES
(
    (SELECT id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1),
    (SELECT id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1),
    'Create rough cut',
    'Assemble initial rough cut from provided footage',
    'in_progress',
    'high',
    '2024-01-18 17:00:00+00'
),
(
    (SELECT id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1),
    (SELECT id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1),
    'Color correction',
    'Apply color grading and correction to match brand guidelines',
    'todo',
    'medium',
    '2024-01-19 17:00:00+00'
),
(
    (SELECT id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1),
    (SELECT id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1),
    'Audio mixing',
    'Mix and master audio tracks, add sound effects',
    'completed',
    'high',
    '2024-01-16 17:00:00+00'
),
(
    (SELECT id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1),
    (SELECT id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1),
    'Final render',
    'Export final video in required formats',
    'todo',
    'urgent',
    '2024-01-20 17:00:00+00'
);

-- Insert sample project assignments
INSERT INTO project_assignments (project_id, assigned_by, assigned_to, role_type) VALUES
(
    (SELECT id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1),
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    (SELECT id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1),
    'editor'
),
(
    (SELECT id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1),
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    (SELECT id FROM users WHERE email = 'sarah.wilson@editlobby.com' LIMIT 1),
    'qc'
),
(
    (SELECT id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1),
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    (SELECT id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1),
    'editor'
),
(
    (SELECT id FROM projects WHERE title = 'Event Highlights Reel' LIMIT 1),
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    (SELECT id FROM users WHERE email = 'emily.davis@editlobby.com' LIMIT 1),
    'qc'
);

-- Insert additional notifications
INSERT INTO notifications (user_id, title, message, type, is_read, project_id) VALUES
(
    (SELECT id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1),
    'Task Due Soon',
    'Your task "Create rough cut" is due in 2 hours.',
    'warning',
    false,
    (SELECT id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1)
),
(
    (SELECT id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1),
    'Project Assignment',
    'You have been assigned to work on "Product Launch Promo".',
    'project_update',
    false,
    (SELECT id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1)
),
(
    (SELECT id FROM users WHERE email = 'sarah.wilson@editlobby.com' LIMIT 1),
    'QC Review Required',
    'Project "Corporate Training Video" is ready for quality control review.',
    'project_update',
    false,
    (SELECT id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1)
),
(
    (SELECT id FROM users WHERE email = 'emily.davis@editlobby.com' LIMIT 1),
    'Welcome to Edit Lobby',
    'Your QC reviewer account has been created. You can now start reviewing projects.',
    'system',
    true,
    NULL
);

-- Update user settings for existing users
INSERT INTO user_settings (user_id, theme, language, timezone, email_notifications, push_notifications, comment_notifications, project_update_notifications, billing_notifications, profile_visible, activity_visible)
SELECT 
    id,
    'dark',
    'en',
    'UTC',
    true,
    true,
    true,
    true,
    false,
    true,
    false
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Update active project counts for all users
UPDATE users SET active_projects = (
    CASE 
        WHEN role = 'employee' THEN (
            SELECT COUNT(*) 
            FROM projects 
            WHERE assigned_editor_id = users.id 
            AND status IN ('assigned', 'in_progress', 'qc_review')
        )
        WHEN role = 'qc' THEN (
            SELECT COUNT(*) 
            FROM projects 
            WHERE assigned_qc_id = users.id 
            AND status IN ('qc_review', 'client_review')
        )
        ELSE 0
    END
);
