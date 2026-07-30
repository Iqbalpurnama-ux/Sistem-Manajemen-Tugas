-- Create notifications_log table
CREATE TABLE IF NOT EXISTS public.notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- e.g., 'deadline_reminder_24h'
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs (inserts will be done by Edge Function / Service Role)
CREATE POLICY "Users can view their own notifications log"
ON public.notifications_log FOR SELECT
USING (auth.uid() = user_id);

-- =========================================================================
-- CRON JOB SETUP (pg_cron + pg_net)
-- =========================================================================
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Note: To schedule the Edge Function, you need to execute the following in your Supabase SQL Editor
-- (Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with your actual values):

SELECT cron.schedule(
  'invoke-email-reminder-every-hour',
  '0 * * * *', -- Every hour at minute 0
  $$
    SELECT net.http_post(
        url:='https://migtcrhltdkxdaidlxtb.supabase.co/functions/v1/cron-email-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZ3RjcmhsdGRreGRhaWRseHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzkxNjEsImV4cCI6MjEwMDY1NTE2MX0.MxpX_jO9b193B9ttrudKnL1quShO_reHI8kNCLSh70w"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
