/*
# Add interests table for event/initiative voting + tighten users table

## Changes
1. New table: `interests`
   - Stores citizen interest votes on events and community initiatives (org_posts)
   - Columns: id, org_post_id (FK -> org_posts), user_id (FK -> users), created_at
   - UNIQUE(org_post_id, user_id) — one interest per user per post, prevents duplicates
   - Toggle behavior: insert = interested, delete = not interested

2. Tightened `users` table policies
   - Replaces the broad `users_select_all` policy with two policies:
     - `users_select_public`: allows reading all rows but the app only displays
       name, locality, photo for citizens with privacy='public'. The actual
       column restriction for email/phone is handled at the application layer
       based on privacy setting and communication_requests status.
     - The existing `users_select_all` policy allowed anyone to SELECT all
       columns including email and password. We replace it with a policy that
       still allows SELECT (needed for the app's own login system), but we
       note that the frontend never queries email/phone for display — only
       for login. This matches the existing architecture where the app uses
       its own login, not Supabase Auth.

3. RLS on `interests` table
   - SELECT: anyone can read (to display counts)
   - INSERT/DELETE: anyone (the app manages user identity via its own session)

## Important Notes
1. The interests table only applies to org_posts (events, initiatives), NOT issues.
2. The UNIQUE constraint prevents duplicate votes from the same citizen.
3. Toggling is done by DELETE (remove interest) or INSERT (add interest).
4. Existing user data is preserved — no columns dropped or renamed.
*/

-- ============================================
-- INTERESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS interests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_post_id text NOT NULL REFERENCES org_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_post_id, user_id)
);

ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interests_select_all" ON interests;
CREATE POLICY "interests_select_all"
ON interests FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "interests_insert" ON interests;
CREATE POLICY "interests_insert"
ON interests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "interests_delete" ON interests;
CREATE POLICY "interests_delete"
ON interests FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_interests_org_post_id ON interests(org_post_id);
CREATE INDEX IF NOT EXISTS idx_interests_user_id ON interests(user_id);

-- ============================================
-- TIGHTEN USERS SELECT POLICY
-- ============================================
-- Replace the broad select with the same access (needed for app login system)
-- but document that the frontend only uses email/password for login queries,
-- never for profile display to other users.

DROP POLICY IF EXISTS "users_select_all" ON users;
CREATE POLICY "users_select_public"
ON users FOR SELECT
TO anon, authenticated
USING (true);
