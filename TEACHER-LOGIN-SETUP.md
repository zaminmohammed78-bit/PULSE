# AURAWAY teacher access setup

The teacher portal has **Sign up** and **Sign in** buttons. Both use a first name and the private teacher access code. The code is verified by a Supabase Edge Function; it is not embedded in the website's HTML or JavaScript.

## Required one-time setup

1. In the Supabase project connected in `supabase.js`, open **Project Settings → Edge Functions → Secrets** (or use the Supabase CLI).
2. Add a secret named `TEACHER_ACCESS_CODE` and set its value to the private teacher code. Do not put the value in GitHub, this file, HTML, JavaScript, or a browser screenshot.
3. Deploy the function in `supabase/functions/teacher-access/index.ts` with the name `teacher-access`.
   - With the Supabase CLI: `supabase functions deploy teacher-access`
   - The deployed function also needs the standard `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment values. Supabase normally provides these to Edge Functions.
4. In Supabase Authentication settings, enable the **Email** provider. The function creates/uses the internal teacher identity `teacher@auraway.app` and returns a one-time magic-link token to the browser; the teacher does not enter an email address.
5. Open `teacher.html`, choose **Sign up** for the first setup, and enter the first name and private code. Later, use **Sign in**.

## Important account model

This version intentionally uses one shared teacher identity because the school has one shared teacher code. The first name shown in the portal is updated at each successful sign-in. Anyone who knows the shared code can access the teacher portal, so share it only with trusted teachers. For separate teacher accounts and individual audit trails, each teacher should eventually receive their own identity/code.

## Database security still required

A successful sign-in creates a real Supabase Auth session, but it does not automatically secure the database. Configure and test Row Level Security (RLS) on `students`, `student_updates`, and `assignments` before using real student data. Policies should allow the authenticated teacher identity to perform teacher operations and restrict student reads/writes to the correct student. Never expose the Supabase service-role key in browser code.

## Student family accounts

Student codes are verified against the existing `students` table. The browser can save multiple sibling profiles, switch between them, add another code, and sign out. The family list is stored on that device and is not a cloud family account shared across devices.
