// @ts-ignore
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

// @ts-ignore
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// @ts-ignore
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// @ts-ignore
serve(async (req: Request) => {
  try {
    // Basic auth check for cron if needed, though pg_net sends the auth header we configured.
    // Ensure we have required env vars
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    // Initialize Supabase client with SERVICE_ROLE key to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch tasks that are due in the next 24 hours and are not 'Done'
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        deadline,
        user_id,
        profiles (
          email,
          full_name
        )
      `)
      .neq('status', 'Done')
      .gt('deadline', now.toISOString())
      .lte('deadline', in24Hours.toISOString());

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: "No tasks due in 24 hours." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    let emailsSent = 0;

    // Process each task
    for (const task of tasks) {
      const userEmail = task.profiles?.email;
      const userName = task.profiles?.full_name || 'Pengguna BesokAja';

      if (!userEmail) continue;

      const deadlineTime = new Date(task.deadline).getTime();
      const hoursLeft = (deadlineTime - now.getTime()) / (1000 * 60 * 60);

      // Determine which reminder type to send (1h or 24h)
      let reminderType = '';
      let emailTitle = '';
      let emailMessage = '';

      if (hoursLeft <= 1) {
        reminderType = 'deadline_reminder_1h';
        emailTitle = `🚨 GAWAT! Tugas "${task.title}" tinggal 1 JAM lagi! 😱`;
        emailMessage = 'Waduh kak, tugasnya udah mau mepet banget nih (kurang dari 1 jam)! Jangan sampai kelupaan ya, yuk tarik napas dan selesaikan sekarang! 🔥';
      } else if (hoursLeft <= 24) {
        reminderType = 'deadline_reminder_24h';
        emailTitle = `⏰ Psst... Tugas "${task.title}" nyariin kamu tuh! 👀`;
        emailMessage = 'Tenggat waktu tugasmu tinggal sebentar lagi lho (kurang dari 24 jam). Semangat ngerjainnya ya! 💪';
      } else {
        continue; // Should not happen due to DB query
      }

      // Idempotency check: Have we already sent this specific reminder for this task?
      const { data: existingLog } = await supabase
        .from('notifications_log')
        .select('id')
        .eq('task_id', task.id)
        .eq('notification_type', reminderType)
        .maybeSingle();

      if (existingLog) {
        console.log(`${reminderType} already sent for task ${task.id}`);
        continue; // Skip, already sent
      }

      // Send Email via Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'BesokAja <noreply@resend.dev>', // Replace with verified domain if you have one
          to: [userEmail],
          subject: emailTitle,
          html: `
            <div style="font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FFF6F9; border-radius: 24px; border: 2px dashed #F1699C; text-align: center;">
              <h1 style="color: #3D2436; margin-bottom: 5px; font-size: 32px; letter-spacing: -1px;">Besok<span style="color: #C22C63;">Aja</span> ✨</h1>
              
              <h2 style="color: #E8447F; margin-top: 30px; font-size: 24px;">Halo Kak ${userName}! 💖</h2>
              <p style="font-size: 16px; color: #8A6B79; line-height: 1.6; margin-bottom: 10px;">${emailMessage}</p>
              
              <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; box-shadow: 0 8px 24px rgba(214,110,150,0.15);">
                <h3 style="margin-top: 0; color: #3D2436; font-size: 20px; font-weight: 800;">📌 ${task.title}</h3>
                <div style="background-color: #FDEDD2; display: inline-block; padding: 8px 16px; border-radius: 20px; margin-top: 10px;">
                  <p style="margin: 0; color: #E8A33D; font-weight: bold; font-size: 15px;">
                    ⏰ ${new Date(task.deadline).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <p style="font-size: 16px; color: #8A6B79; margin-bottom: 30px; font-weight: 600;">Yuk buruan diselesaikan biar hatimu tenang! 🦋</p>
              
              <a href="http://localhost:3000" style="display: inline-block; background: linear-gradient(135deg, #F1699C, #C22C63); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 15px rgba(194, 44, 99, 0.4);">
                🚀 Sikat Tugasnya Sekarang!
              </a>
              
              <p style="margin-top: 40px; font-size: 13px; color: #C3A9B5; font-weight: 500;">
                Dikirim dengan 💌 oleh robot super rajin BesokAja.
              </p>
            </div>
          `
        })
      });

      if (res.ok) {
        // Log the successful notification
        await supabase
          .from('notifications_log')
          .insert({
            task_id: task.id,
            user_id: task.user_id,
            notification_type: reminderType
          });
        emailsSent++;
      } else {
        const errorData = await res.json();
        console.error(`Failed to send email to ${userEmail}:`, errorData);
      }
    }

    return new Response(JSON.stringify({ message: `Successfully processed tasks. Emails sent: ${emailsSent}` }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
