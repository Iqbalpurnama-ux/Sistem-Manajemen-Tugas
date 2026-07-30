-- =====================================================
-- MIGRATION: Add performance indexes for production
-- Date: 2026-07-30
-- =====================================================

-- Index untuk query tasks by user (paling sering dipakai)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id 
  ON public.tasks(user_id);

-- Index untuk query tasks berdasarkan deadline (untuk email reminder)
CREATE INDEX IF NOT EXISTS idx_tasks_deadline 
  ON public.tasks(deadline) 
  WHERE deadline IS NOT NULL;

-- Index komposit untuk dashboard query (user + status + archived)
CREATE INDEX IF NOT EXISTS idx_tasks_user_status_archived 
  ON public.tasks(user_id, status, is_archived);

-- Index untuk attachments by task_id (dipakai saat delete task)
CREATE INDEX IF NOT EXISTS idx_attachments_task_id 
  ON public.attachments(task_id);

-- Index untuk notifications_log idempotency check
CREATE INDEX IF NOT EXISTS idx_notifications_task_type 
  ON public.notifications_log(task_id, notification_type);

-- Index untuk categories by user_id (sidebar query)
CREATE INDEX IF NOT EXISTS idx_categories_user_id 
  ON public.categories(user_id);

-- Index untuk tasks updated_at (useful for sorting)
CREATE INDEX IF NOT EXISTS idx_tasks_created_at 
  ON public.tasks(created_at DESC);
