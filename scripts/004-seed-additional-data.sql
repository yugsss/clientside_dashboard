-- Insert sample project assignments (only if table exists and referenced data exists)
DO $$
DECLARE
    corporate_video_id UUID;
    product_promo_id UUID;
    event_highlights_id UUID;
    admin_id UUID;
    john_smith_id UUID;
    sarah_wilson_id UUID;
    mike_johnson_id UUID;
    emily_davis_id UUID;
BEGIN
    -- Check if project_assignments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_assignments') THEN
        -- Get project IDs safely
        SELECT id INTO corporate_video_id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1;
        SELECT id INTO product_promo_id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1;
        SELECT id INTO event_highlights_id FROM projects WHERE title = 'Event Highlights Reel' LIMIT 1;
        
        -- Get user IDs safely
        SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
        SELECT id INTO john_smith_id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1;
        SELECT id INTO sarah_wilson_id FROM users WHERE email = 'sarah.wilson@editlobby.com' LIMIT 1;
        SELECT id INTO mike_johnson_id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1;
        SELECT id INTO emily_davis_id FROM users WHERE email = 'emily.davis@editlobby.com' LIMIT 1;

        -- Insert only if all required references exist
        IF corporate_video_id IS NOT NULL AND admin_id IS NOT NULL AND john_smith_id IS NOT NULL THEN
            INSERT INTO project_assignments (project_id, assigned_by, assigned_to, role_type) VALUES
            (corporate_video_id, admin_id, john_smith_id, 'editor');
        END IF;

        IF corporate_video_id IS NOT NULL AND admin_id IS NOT NULL AND sarah_wilson_id IS NOT NULL THEN
            INSERT INTO project_assignments (project_id, assigned_by, assigned_to, role_type) VALUES
            (corporate_video_id, admin_id, sarah_wilson_id, 'qc');
        END IF;

        IF product_promo_id IS NOT NULL AND admin_id IS NOT NULL AND mike_johnson_id IS NOT NULL THEN
            INSERT INTO project_assignments (project_id, assigned_by, assigned_to, role_type) VALUES
            (product_promo_id, admin_id, mike_johnson_id, 'editor');
        END IF;

        IF event_highlights_id IS NOT NULL AND admin_id IS NOT NULL AND emily_davis_id IS NOT NULL THEN
            INSERT INTO project_assignments (project_id, assigned_by, assigned_to, role_type) VALUES
            (event_highlights_id, admin_id, emily_davis_id, 'qc');
        END IF;
    END IF;
END $$;

-- Insert sample editor tasks (only if table exists and referenced data exists)
DO $$
DECLARE
    corporate_video_id UUID;
    product_promo_id UUID;
    john_smith_id UUID;
    mike_johnson_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'editor_tasks') THEN
        -- Get project IDs safely
        SELECT id INTO corporate_video_id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1;
        SELECT id INTO product_promo_id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1;
        
        -- Get user IDs safely
        SELECT id INTO john_smith_id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1;
        SELECT id INTO mike_johnson_id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1;

        -- Insert only if all required references exist
        IF corporate_video_id IS NOT NULL AND john_smith_id IS NOT NULL THEN
            INSERT INTO editor_tasks (project_id, editor_id, title, description, status, priority, due_date) VALUES
            (corporate_video_id, john_smith_id, 'Create rough cut', 'Assemble initial rough cut from provided footage', 'in_progress', 'high', '2024-01-18 17:00:00+00'),
            (corporate_video_id, john_smith_id, 'Color correction', 'Apply color grading and correction to match brand guidelines', 'todo', 'medium', '2024-01-19 17:00:00+00');
        END IF;

        IF product_promo_id IS NOT NULL AND mike_johnson_id IS NOT NULL THEN
            INSERT INTO editor_tasks (project_id, editor_id, title, description, status, priority, due_date) VALUES
            (product_promo_id, mike_johnson_id, 'Audio mixing', 'Mix and master audio tracks, add sound effects', 'completed', 'high', '2024-01-16 17:00:00+00'),
            (product_promo_id, mike_johnson_id, 'Final render', 'Export final video in required formats', 'todo', 'urgent', '2024-01-20 17:00:00+00');
        END IF;
    END IF;
END $$;

-- Insert additional notifications (only if referenced projects and users exist)
DO $$
DECLARE
    corporate_video_id UUID;
    product_promo_id UUID;
    john_smith_id UUID;
    mike_johnson_id UUID;
    sarah_wilson_id UUID;
    emily_davis_id UUID;
BEGIN
    -- Get IDs safely
    SELECT id INTO corporate_video_id FROM projects WHERE title = 'Corporate Training Video' LIMIT 1;
    SELECT id INTO product_promo_id FROM projects WHERE title = 'Product Launch Promo' LIMIT 1;
    SELECT id INTO john_smith_id FROM users WHERE email = 'john.smith@editlobby.com' LIMIT 1;
    SELECT id INTO mike_johnson_id FROM users WHERE email = 'mike.johnson@editlobby.com' LIMIT 1;
    SELECT id INTO sarah_wilson_id FROM users WHERE email = 'sarah.wilson@editlobby.com' LIMIT 1;
    SELECT id INTO emily_davis_id FROM users WHERE email = 'emily.davis@editlobby.com' LIMIT 1;

    -- Insert notifications only if users exist
    IF john_smith_id IS NOT NULL AND corporate_video_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, is_read, project_id) VALUES
        (
            john_smith_id,
            'Task Due Soon',
            'Your task "Create rough cut" is due in 2 hours.',
            'warning',
            false,
            corporate_video_id
        );
    END IF;

    IF mike_johnson_id IS NOT NULL AND product_promo_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, is_read, project_id) VALUES
        (
            mike_johnson_id,
            'Project Assignment',
            'You have been assigned to work on "Product Launch Promo".',
            'project_update',
            false,
            product_promo_id
        );
    END IF;

    IF sarah_wilson_id IS NOT NULL AND corporate_video_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, is_read, project_id) VALUES
        (
            sarah_wilson_id,
            'QC Review Required',
            'Project "Corporate Training Video" is ready for quality control review.',
            'project_update',
            false,
            corporate_video_id
        );
    END IF;

    IF emily_davis_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, is_read, project_id) VALUES
        (
            emily_davis_id,
            'Welcome to Edit Lobby',
            'Your QC reviewer account has been created. You can now start reviewing projects.',
            'system',
            true,
            NULL
        );
    END IF;
END $$;

-- Update user settings for existing users (only if user_settings table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
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
    END IF;
END $$;

-- Update active project counts for all users (only if required columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'active_projects') THEN
        UPDATE users SET active_projects = (
            CASE 
                WHEN role = 'employee' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'assigned_editor_id') THEN (
                    SELECT COUNT(*) 
                    FROM projects 
                    WHERE assigned_editor_id = users.id 
                    AND status IN ('assigned', 'in_progress', 'qc_review')
                )
                WHEN role = 'qc' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'assigned_qc_id') THEN (
                    SELECT COUNT(*) 
                    FROM projects 
                    WHERE assigned_qc_id = users.id 
                    AND status IN ('qc_review', 'client_review')
                )
                ELSE 0
            END
        );
    END IF;
END $$;
