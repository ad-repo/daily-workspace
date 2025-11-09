-- Baseline database dump for E2E testing
-- Contains realistic data for testing scenarios

-- Daily Notes
INSERT INTO daily_notes (id, date, fire_rating, daily_goal, created_at, updated_at) VALUES
(1, '2025-11-05', 3, 'Complete E2E test setup', '2025-11-05 08:00:00', '2025-11-05 08:00:00'),
(2, '2025-11-06', 4, 'Implement critical features', '2025-11-06 08:00:00', '2025-11-06 08:00:00'),
(3, '2025-11-07', 0, '', '2025-11-07 08:00:00', '2025-11-07 08:00:00');

-- Labels
INSERT INTO labels (id, name, color, created_at) VALUES
(1, 'urgent', '#ef4444', '2025-11-01 08:00:00'),
(2, 'bug', '#dc2626', '2025-11-01 08:00:00'),
(3, 'feature', '#3b82f6', '2025-11-01 08:00:00'),
(4, '🔥', '#f59e0b', '2025-11-01 08:00:00');

-- Note Entries
INSERT INTO note_entries (id, daily_note_id, title, content, content_type, order_index, include_in_report, is_important, is_completed, is_dev_null, created_at, updated_at) VALUES
(1, 1, 'First Entry', '<p>This is the first test entry with <strong>rich text</strong>.</p>', 'rich_text', 0, 0, 1, 0, 0, '2025-11-05 09:00:00', '2025-11-05 09:00:00'),
(2, 1, 'Second Entry', '<p>Another entry for testing.</p>', 'rich_text', 1, 1, 0, 1, 0, '2025-11-05 10:00:00', '2025-11-05 10:00:00'),
(3, 2, 'Bug Fix Entry', '<p>Fixed a critical bug in the system.</p>', 'rich_text', 0, 1, 1, 1, 0, '2025-11-06 09:00:00', '2025-11-06 09:00:00');

-- Entry Labels Association
INSERT INTO entry_labels (entry_id, label_id) VALUES
(1, 1),
(1, 4),
(2, 3),
(3, 2);

-- Sprint Goals
INSERT INTO sprint_goals (id, text, start_date, end_date, created_at, updated_at) VALUES
(1, 'Complete test suite implementation', '2025-11-01', '2025-11-14', '2025-11-01 08:00:00', '2025-11-01 08:00:00');

-- Quarterly Goals
INSERT INTO quarterly_goals (id, text, start_date, end_date, created_at, updated_at) VALUES
(1, 'Launch version 5.0 with full test coverage', '2025-10-01', '2025-12-31', '2025-10-01 08:00:00', '2025-10-01 08:00:00');

-- App Settings
INSERT INTO app_settings (id, sprint_goals, quarterly_goals, sprint_start_date, sprint_end_date, quarterly_start_date, quarterly_end_date, created_at, updated_at) VALUES
(1, '', '', '', '', '', '', '2025-11-01 08:00:00', '2025-11-01 08:00:00');

