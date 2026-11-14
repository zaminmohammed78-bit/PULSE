# AURAWAY school-admin pilot foundation

## Scope of this first migration

This migration creates the school tenant and membership foundation:
- `schools` stores the pilot school.
- `school_memberships` maps an authenticated Supabase user to a school and role.
- Roles are `school_admin`, `teacher`, `student`, and `parent`.
- Row Level Security allows members to see their school and their own membership. A school admin can view memberships within their school.
- Browser clients cannot create, change, or delete memberships. A trusted server-side workflow must handle invitations and role changes.

## Important: not ready for real student data

This is only the identity foundation. It does not yet add `school_id` to the existing `students`, `assignments`, `student_updates`, or `attendance_records` tables, and it does not replace the current shared teacher login or student-code authentication. Do not run a real-school pilot with personal student information until those changes and their RLS policies have been implemented and tested.

## Applying this migration

Do not run it yet unless the current Supabase project and existing schema have been backed up and reviewed by the project owner or school-authorised administrator. Run the SQL in the Supabase SQL Editor only after reviewing it. Never paste a service-role key into GitHub or browser code.

## Next implementation steps

1. Review the live schema and existing RLS policies for all current school-related tables.
2. Add and backfill `school_id` on those tables, then enforce tenant-scoped RLS.
3. Replace shared teacher-code sign-in with individual Supabase Auth accounts and server-verified school memberships.
4. Build the School Admin dashboard and trusted invitation/deactivation Edge Functions.
5. Test cross-school and cross-role access with synthetic accounts before any real data is entered.
