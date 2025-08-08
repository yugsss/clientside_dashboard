-- Insert demo users with proper password hashes (password: demo123)
-- Hash generated with bcrypt, 12 rounds: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G

DO $$
DECLARE
    sarah_id UUID := gen_random_uuid();
    mike_id UUID := gen_random_uuid();
    emily_id UUID := gen_random_uuid();
    admin_id UUID := gen_random_uuid();
    editor1_id UUID := gen_random_uuid();
    editor2_id UUID := gen_random_uuid();
    qc1_id UUID := gen_random_uuid();
    qc2_id UUID := gen_random_uuid();
    project1_id UUID := gen_random_uuid();
    project2_id UUID := gen_random_uuid();
    project3_id UUID := gen_random_uuid();
    project4_id UUID := gen_random_uuid();
    project5_id UUID := gen_random_uuid();
BEGIN
    -- Insert demo users
    INSERT INTO users (id, email, name, password_hash, role, company, plan_id, plan_name, plan_price, plan_type, plan_features, active_projects, max_projects, total_spent, member_since) VALUES
    (sarah_id, 'sarah@example.com', 'Sarah Johnson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'Creative Studio Inc', 'premium', 'Premium Plan', 299, 'monthly', ARRAY['view_projects', 'comment', 'download_high_res', 'upload_files', 'create_projects'], 2, 10, 598, '2024-01-15'),
    (mike_id, 'mike@example.com', 'Mike Chen', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'Tech Innovations LLC', 'basic', 'Basic Plan', 99, 'per-video', ARRAY['view_projects', 'comment', 'download_low_res'], 1, 3, 297, '2024-02-01'),
    (emily_id, 'emily@example.com', 'Emily Rodriguez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'client', 'Marketing Pro Agency', 'ultimate', 'Ultimate Plan', 599, 'monthly', ARRAY['all'], 3, -1, 1797, '2023-12-10'),
    (admin_id, 'admin@editlobby.com', 'Admin User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'admin', 'EditLobby', 'admin', 'Admin Access', 0, 'monthly', ARRAY['all'], 0, -1, 0, '2023-01-01'),
    (editor1_id, 'editor1@editlobby.com', 'James Wilson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'employee', 'EditLobby', 'employee', 'Employee Access', 0, 'monthly', ARRAY['all'], 3, -1, 0, '2023-06-15'),
    (editor2_id, 'editor2@editlobby.com', 'Lisa Thompson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'employee', 'EditLobby', 'employee', 'Employee Access', 0, 'monthly', ARRAY['all'], 2, -1, 0, '2023-08-20'),
    (qc1_id, 'qc1@editlobby.com', 'Robert Davis', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'qc', 'EditLobby', 'qc', 'QC Access', 0, 'monthly', ARRAY['all'], 2, -1, 0, '2023-09-10'),
    (qc2_id, 'qc2@editlobby.com', 'Maria Garcia', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'qc', 'EditLobby', 'qc', 'QC Access', 0, 'monthly', ARRAY['all'], 1, -1, 0, '2023-10-05');

    -- Insert demo projects
    INSERT INTO projects (id, title, description, status, progress, client_id, assigned_editor_id, assigned_qc_id, frameio_project_id, revisions, max_revisions, due_date, priority) VALUES
    (project1_id, 'Corporate Brand Video', 'A 2-minute corporate brand video showcasing company values and culture', 'in_progress', 75, sarah_id, editor1_id, qc1_id, 'frameio-proj-001', 0, 2, '2024-02-15', 'high'),
    (project2_id, 'Product Launch Campaign', 'Multi-video campaign for new product launch including teaser, demo, and testimonials', 'qc_review', 100, emily_id, editor2_id, qc1_id, 'frameio-proj-002', 1, 3, '2024-02-20', 'urgent'),
    (project3_id, 'Social Media Content Pack', 'Collection of 10 short-form videos for social media platforms', 'client_review', 100, sarah_id, editor1_id, qc2_id, 'frameio-proj-003', 0, 2, '2024-02-10', 'medium'),
    (project4_id, 'Training Video Series', 'Educational video series for employee onboarding (5 episodes)', 'assigned', 25, mike_id, editor2_id, NULL, 'frameio-proj-004', 0, 2, '2024-03-01', 'medium'),
    (project5_id, 'Event Highlight Reel', 'Conference highlight reel with keynote moments and networking footage', 'pending', 0, emily_id, NULL, NULL, NULL, 0, 2, '2024-02-25', 'low');

    -- Insert demo notifications
    INSERT INTO notifications (user_id, title, message, type, is_read, project_id) VALUES
    (sarah_id, 'Project Update', 'Your Corporate Brand Video is 75% complete', 'project_update', FALSE, project1_id),
    (sarah_id, 'Project Ready for Review', 'Your Social Media Content Pack is ready for review', 'project_update', FALSE, project3_id),
    (editor1_id, 'New Project Assigned', 'You have been assigned to work on Corporate Brand Video', 'project_update', TRUE, project1_id),
    (editor2_id, 'Project Approved by QC', 'Your Product Launch Campaign has been approved by QC', 'success', FALSE, project2_id),
    (qc1_id, 'Project Ready for QC', 'Product Launch Campaign is ready for quality control review', 'project_update', FALSE, project2_id),
    (emily_id, 'Project Completed', 'Your Product Launch Campaign has been completed and is ready for review', 'project_update', FALSE, project2_id);

    -- Insert demo video comments
    INSERT INTO video_comments (project_id, user_id, content, type, priority, resolved) VALUES
    (project1_id, sarah_id, 'The intro music seems a bit too loud. Can we lower it slightly?', 'revision', 'medium', FALSE),
    (project2_id, qc1_id, 'Great work on the color grading! The brand colors are perfectly matched.', 'qc_feedback', 'low', TRUE),
    (project3_id, sarah_id, 'Love the transitions between clips. Very smooth!', 'general', 'low', TRUE),
    (project2_id, emily_id, 'The testimonial section could use a bit more dynamic movement', 'revision', 'medium', FALSE);

    -- Insert demo user settings
    INSERT INTO user_settings (user_id, theme, notifications_enabled, email_notifications, auto_play_videos, preferred_quality) VALUES
    (sarah_id, 'light', TRUE, TRUE, TRUE, 'hd'),
    (mike_id, 'dark', TRUE, FALSE, FALSE, 'sd'),
    (emily_id, 'light', TRUE, TRUE, TRUE, '4k'),
    (admin_id, 'dark', TRUE, TRUE, FALSE, 'hd'),
    (editor1_id, 'dark', TRUE, TRUE, TRUE, 'hd'),
    (editor2_id, 'light', TRUE, FALSE, TRUE, 'hd'),
    (qc1_id, 'light', TRUE, TRUE, FALSE, 'hd'),
    (qc2_id, 'dark', TRUE, TRUE, TRUE, 'hd');

    -- Insert demo project activities
    INSERT INTO project_activities (project_id, user_id, action, details) VALUES
    (project1_id, admin_id, 'created', 'Project created by admin'),
    (project1_id, admin_id, 'assigned', 'Project assigned to editor James Wilson'),
    (project1_id, editor1_id, 'progress_updated', 'Progress updated to 25%'),
    (project1_id, editor1_id, 'progress_updated', 'Progress updated to 50%'),
    (project1_id, editor1_id, 'progress_updated', 'Progress updated to 75%'),
    (project2_id, admin_id, 'created', 'Project created by admin'),
    (project2_id, admin_id, 'assigned', 'Project assigned to editor Lisa Thompson'),
    (project2_id, editor2_id, 'progress_updated', 'Progress updated to 100%'),
    (project2_id, qc1_id, 'qc_approved', 'Project approved by QC'),
    (project3_id, admin_id, 'created', 'Project created by admin'),
    (project3_id, admin_id, 'assigned', 'Project assigned to editor James Wilson'),
    (project3_id, editor1_id, 'progress_updated', 'Progress updated to 100%'),
    (project3_id, qc2_id, 'qc_approved', 'Project approved by QC');

END $$;
