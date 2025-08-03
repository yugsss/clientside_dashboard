-- Insert demo users with correct credentials
INSERT INTO users (email, name, password_hash, role, company, avatar) VALUES
('admin@editlobby.com', 'Sarah Admin', '$2b$10$dummy.hash.for.demo', 'admin', 'Edit Lobby', '/placeholder.svg?height=40&width=40&text=SA'),
('editor@editlobby.com', 'Mike Editor', '$2b$10$dummy.hash.for.demo', 'employee', 'Edit Lobby', '/placeholder.svg?height=40&width=40&text=ME'),
('client@company.com', 'John Client', '$2b$10$dummy.hash.for.demo', 'client', 'Acme Corp', '/placeholder.svg?height=40&width=40&text=JC'),
('jane@startup.com', 'Jane Smith', '$2b$10$dummy.hash.for.demo', 'client', 'Startup Inc', '/placeholder.svg?height=40&width=40&text=JS'),
('editor2@editlobby.com', 'Lisa Editor', '$2b$10$dummy.hash.for.demo', 'employee', 'Edit Lobby', '/placeholder.svg?height=40&width=40&text=LE')
ON CONFLICT (email) DO NOTHING;

-- Insert demo projects
INSERT INTO projects (title, description, client_id, assigned_editor_id, status, priority, deadline) VALUES
('Product Launch Video', 'Marketing video for new product launch campaign', 3, 2, 'in_progress', 'high', '2024-02-15 17:00:00'),
('Company Overview', 'Corporate overview video for website', 4, 5, 'review', 'medium', '2024-02-20 12:00:00'),
('Training Series', 'Employee training video series - 5 episodes', 3, 2, 'pending', 'low', '2024-03-01 09:00:00'),
('Event Highlights', 'Conference highlights and key moments', 4, 5, 'completed', 'medium', '2024-01-30 15:00:00');

-- Insert demo videos
INSERT INTO videos (project_id, title, file_url, thumbnail_url, duration, file_size, status) VALUES
(1, 'Product Demo Raw Footage', '/videos/product-demo.mp4', '/thumbnails/product-demo.jpg', 180, 52428800, 'ready'),
(1, 'Customer Testimonials', '/videos/testimonials.mp4', '/thumbnails/testimonials.jpg', 120, 35651584, 'ready'),
(2, 'CEO Interview', '/videos/ceo-interview.mp4', '/thumbnails/ceo-interview.jpg', 300, 89128960, 'processing'),
(4, 'Conference Day 1', '/videos/conf-day1.mp4', '/thumbnails/conf-day1.jpg', 480, 142606336, 'ready');

-- Insert demo comments
INSERT INTO comments (video_id, user_id, content, timestamp_seconds, status) VALUES
(1, 3, 'The product demo looks great! Can we add a call-to-action at the end?', 165.5, 'open'),
(1, 2, 'I''ll add the CTA in the next revision. Good catch!', NULL, 'open'),
(2, 3, 'The audio quality on the second testimonial needs improvement', 45.2, 'open'),
(4, 4, 'Love the opening sequence! Very engaging.', 12.0, 'resolved');

-- Insert demo chat messages
INSERT INTO chat_messages (user_id, project_id, content, message_type) VALUES
(3, 1, 'Hi Mike! Just wanted to check on the progress of the product launch video.', 'text'),
(2, 1, 'Hey John! It''s coming along great. I''ve uploaded the first cut for your review.', 'text'),
(3, 1, 'Awesome! I''ll take a look and leave some feedback.', 'text'),
(2, 1, 'Perfect. Let me know if you need any changes!', 'text'),
(4, 2, 'The company overview video looks fantastic! Great work Lisa.', 'text'),
(5, 2, 'Thank you! I''m glad you like it. Ready for final approval?', 'text');

-- Insert demo notifications
INSERT INTO notifications (user_id, title, message, type, is_read, action_url) VALUES
(3, 'Video Ready for Review', 'Your product launch video is ready for review', 'project', false, '/projects/1'),
(3, 'New Comment Added', 'Mike Editor replied to your comment on Product Demo Raw Footage', 'comment', false, '/projects/1/videos/1'),
(2, 'Project Assigned', 'You have been assigned to Training Series project', 'project', true, '/projects/3'),
(4, 'Video Completed', 'Your Event Highlights video has been completed', 'project', false, '/projects/4'),
(1, 'System Maintenance', 'Scheduled maintenance tonight from 2-4 AM EST', 'system', true, null),
(2, 'New Client Message', 'John Client sent you a message about Product Launch Video', 'info', false, '/chat/1'),
(5, 'Deadline Reminder', 'Company Overview project deadline is in 3 days', 'warning', false, '/projects/2');

-- Insert demo user settings
INSERT INTO user_settings (user_id, theme, email_notifications, push_notifications, project_notifications, comment_notifications, marketing_emails) VALUES
(1, 'dark', true, true, true, true, false),
(2, 'light', true, true, true, true, false),
(3, 'system', true, false, true, true, true),
(4, 'light', false, false, true, false, false),
(5, 'dark', true, true, true, true, false)
ON CONFLICT (user_id) DO NOTHING;
