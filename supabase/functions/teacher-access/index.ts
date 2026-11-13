import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const accessCode = Deno.env.get("TEACHER_ACCESS_CODE");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!accessCode || !supabaseUrl || !serviceRoleKey) {
      console.error("Teacher access function is missing required server secrets.");
      return json({ error: "Teacher login is not configured yet." }, 503);
    }

    const body = await req.json();
    const action = body?.action;
    const firstName = typeof body?.first_name === "string" ? body.first_name.trim() : "";
    const suppliedCode = typeof body?.access_code === "string" ? body.access_code : "";

    if (!["signup", "signin"].includes(action) || !firstName || firstName.length > 60 || !suppliedCode) {
      return json({ error: "Enter a valid first name and access code." }, 400);
    }
    if (suppliedCode !== accessCode) {
      return json({ error: "The teacher access code is incorrect." }, 401);
    }

    // This project uses one shared teacher identity because the school has one shared access code.
    // The code is checked only on the server; it is never sent back to the browser.
    const email = "teacher@auraway.app";
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: listed, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) throw listError;

    let teacher = listed.users.find((user) => user.email?.toLowerCase() === email);
    if (!teacher && action === "signin") {
      return json({ error: "No teacher account exists yet. Choose Sign up first." }, 404);
    }

    if (!teacher) {
      const randomPassword = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "") + "Aa1!";
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { display_name: firstName },
      });
      if (error) throw error;
      teacher = data.user;
    } else {
      const { data, error } = await admin.auth.admin.updateUserById(teacher.id, {
        user_metadata: { ...teacher.user_metadata, display_name: firstName },
      });
      if (error) throw error;
      teacher = data.user;
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError) throw linkError;

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) throw new Error("Supabase did not return a one-time sign-in token.");
    return json({ token_hash: tokenHash });
  } catch (error) {
    console.error("Teacher access error:", error);
    return json({ error: "Teacher access could not be completed. Please try again." }, 500);
  }
});
