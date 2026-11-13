# AURAWAY teacher sign-in setup

The teacher portal now uses Supabase Auth. The access code is entered into a password field and is not stored in this repository or printed in the page source.

## One-time Supabase setup

1. Open the Supabase project connected in `supabase.js`.
2. Go to **Authentication → Users** and create a teacher user.
3. Use this fixed sign-in email: `teacher@auraway.app`.
4. Set that user's password to the teacher access code privately in the Supabase dashboard. Do not put the code in GitHub, HTML, JavaScript, or screenshots.
5. Keep email/password sign-in enabled.

Teachers then open `teacher.html`, enter their name and the access code, and use **Sign out** when finished.

## Important security note

This adds a real Supabase Auth session to the teacher portal, but the existing database tables and Row Level Security policies were not included in this repository. Before using real student records, configure and test RLS policies so only authenticated teachers can create, edit, and delete student records, and student access is restricted to the matching student. A front-end login screen alone does not protect database rows.

## Student family accounts

Student codes are verified against the existing `students` table. The browser can save multiple sibling profiles on that device, switch between them, add another code, and sign out. The family list is device-local; it is not a cloud family account shared across devices.
