import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://zaminmohammed78-bit.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:5500"
]);

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function cors(origin: string | null) {
  const allowed = origin && allowedOrigins.has(origin)
    ? origin
    : "https://zaminmohammed78-bit.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(body: Record<string, unknown>, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("cf-connecting-ip") || "unknown";
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405, origin);

  const now = Date.now();
  const ip = clientIp(req);
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }
  const bucket = attempts.get(ip);
  if (bucket && bucket.resetAt > now && bucket.count >= MAX_ATTEMPTS) {
    return json({ error: "Too many attempts. Please wait 15 minutes and try again." }, 429, origin);
  }
  if (!bucket || bucket.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    bucket.count += 1;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body?.student_code === "string"
      ? body.student_code.trim().toUpperCase()
      : "";

    if (!/^[A-Z0-9-]{4,40}$/.test(code)) {
      return json({ success: false, error: "Invalid student code. Please check it with the teacher." }, 200, origin);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      return json({ success: false, error: "Parent report service is not configured." }, 503, origin);
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: student, error: studentError } = await admin
      .from("students")
      .select("student_name,class_name,student_code,study_hours,teacher_request,areas_to_improve")
      .eq("student_code", code)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student) {
      return json({ success: false, error: "Invalid student code. Please check the exact code with the teacher." }, 200, origin);
    }

    const [{ data: attendance, error: attendanceError }, { data: assignments, error: assignmentsError }, { data: updates, error: updatesError }, { data: timetable, error: timetableError }] = await Promise.all([
      admin.from("attendance_records")
        .select("attendance_date,status")
        .eq("student_code", code)
        .order("attendance_date", { ascending: false })
        .limit(365),
      admin.from("assignments")
        .select("id,title,subject,due_date,target_code")
        .or(`target_code.eq.ALL,target_code.eq.${code},target_code.eq.CLASS:${student.class_name}`)
        .order("due_date", { ascending: true })
        .limit(200),
      admin.from("student_updates")
        .select("assignment_id,status,updated_at")
        .eq("student_code", code)
        .in("status", ["Completed", "Not Completed"])
        .order("updated_at", { ascending: false })
        .limit(500),
      admin.from("pulse_timetable")
        .select("id,day_of_week,period_type,title,start_time,end_time,room,note")
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true })
    ]);

    if (attendanceError) throw attendanceError;
    if (assignmentsError) throw assignmentsError;
    if (updatesError) throw updatesError;
    if (timetableError) throw timetableError;

    return json({
      success: true,
      student,
      attendance: attendance || [],
      assignments: assignments || [],
      updates: updates || [],
      timetable: timetable || []
    }, 200, origin);
  } catch (error) {
    console.error("Parent report lookup failed:", error instanceof Error ? error.message : "unknown error");
    return json({ success: false, error: "Unable to load the report right now. Please try again later." }, 500, origin);
  }
});