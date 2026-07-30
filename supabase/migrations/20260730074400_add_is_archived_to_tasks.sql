-- Migration: Add is_archived column to tasks table

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create an index to optimize querying archived vs unarchived tasks
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON public.tasks(is_archived);
