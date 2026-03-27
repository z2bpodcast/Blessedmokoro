-- ============================================================
-- Z2B PUSH NOTIFICATIONS SQL — FIXED
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription   text,
  channels       jsonb DEFAULT '{}',
  subscribed_at  timestamptz DEFAULT now(),
  user_agent     text,
  UNIQUE(user_id)
);

-- 2. Add missing columns to notification_log if they don't exist
ALTER TABLE notification_log ADD COLUMN IF NOT EXISTS read    boolean NOT NULL DEFAULT false;
ALTER TABLE notification_log ADD COLUMN IF NOT EXISTS url     text;
ALTER TABLE notification_log ADD COLUMN IF NOT EXISTS body    text;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_push_subs_user   ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_user   ON notification_log(user_id, sent_at DESC);

-- Create unread index only after column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_notif_log_unread'
  ) THEN
    CREATE INDEX idx_notif_log_unread ON notification_log(user_id, read) WHERE read = false;
  END IF;
END $$;

-- 4. RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_push_sub" ON push_subscriptions;
CREATE POLICY "own_push_sub" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "service_insert_notif" ON notification_log;
CREATE POLICY "service_insert_notif" ON notification_log
  FOR INSERT WITH CHECK (true);

-- 5. Mark notification as read function
CREATE OR REPLACE FUNCTION mark_notification_read(notif_id uuid)
RETURNS void AS $$
  UPDATE notification_log SET read = true WHERE id = notif_id AND user_id = auth.uid();
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void AS $$
  UPDATE notification_log SET read = true WHERE user_id = auth.uid() AND read = false;
$$ LANGUAGE sql;

-- Verify
SELECT 'push_subscriptions' as tbl, count(*) FROM push_subscriptions
UNION ALL SELECT 'notification_log', count(*) FROM notification_log;
