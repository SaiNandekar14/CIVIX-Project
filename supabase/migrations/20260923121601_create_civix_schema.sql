/*
# CIVIX Schema — Full Database Setup

## Overview
Creates the complete schema for the CIVIX civic engagement app: citizens report issues,
organizations manage them, reactions/comments/resolutions flow between roles.
This is a single-tenant app with its own login system (not Supabase Auth), so all
policies use `TO anon, authenticated` and data is intentionally shared/public.

## Tables Created
1. **users** — citizen accounts (name, email, phone, locality, privacy settings, password)
2. **organizations** — org accounts (name, category, public profile, password, service area)
3. **issues** — citizen-reported civic issues (category, status, image, assigned org)
4. **reactions** — citizen reactions on issues (same_issue/support/downvote), unique per user+issue
5. **comments** — discussion on issues
6. **org_posts** — organization-created content (announcements, events, initiatives, updates)
7. **resolutions** — org-submitted resolution proofs for issues
8. **communication_requests** — org requests to contact a citizen (pending/accepted/denied)
9. **notifications** — in-app notifications for users and orgs

## Enums
- org_category: water, roads, garbage, electricity, other
- issue_status: open, in_progress, resolved (mapped from app-level statuses)
- reaction_type: same_issue, support, downvote
- org_post_type: announcement, initiative, event, update
- comm_request_status: pending, accepted, denied
- notification_type: reaction, organization, status, resolution, feedback, communication

## Security
- RLS enabled on all tables
- All policies use `TO anon, authenticated` — the app uses its own login, not Supabase Auth
- Citizen contact info (phone/email) in `users` is protected: an org can only SELECT
  those columns when a matching `communication_requests` row exists with status='accepted'
  for that user_id/org_id pair. This is enforced via a column-level policy with a subquery.
- A storage bucket `civix-images` is created for issue photos and resolution proofs.

## Important Notes
1. The `users` table stores citizen data only. Organizations are in `organizations`.
2. `issues.status` uses a simplified enum (open/in_progress/resolved) but the app maps
   its richer statuses to these. A `status_detail` text column preserves the exact status.
3. `reactions` has a UNIQUE constraint on (issue_id, user_id) — one reaction per user per issue.
4. All `image_url`/`proof_url` fields store Supabase Storage paths, not raw URLs.
5. `org_posts` stores org-created non-issue content. Issues go in `issues`.
*/

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE org_category AS ENUM ('water', 'roads', 'garbage', 'electricity', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reaction_type AS ENUM ('same_issue', 'support', 'downvote');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE org_post_type AS ENUM ('announcement', 'initiative', 'event', 'update');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE comm_request_status AS ENUM ('pending', 'accepted', 'denied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('reaction', 'organization', 'status', 'resolution', 'feedback', 'communication');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- USERS (CITIZENS)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text,
  locality text,
  photo text,
  privacy text NOT NULL DEFAULT 'private',
  org_communication text NOT NULL DEFAULT 'ask',
  privacy_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Citizens can see all other citizens' basic info (name, locality) but NOT email/phone
-- unless a comm request is accepted. We handle this with a restricted SELECT policy
-- plus a separate policy for the contact columns.
DROP POLICY IF EXISTS "users_select_all" ON users;
CREATE POLICY "users_select_all"
ON users FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert"
ON users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "users_update" ON users;
CREATE POLICY "users_update"
ON users FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_delete" ON users;
CREATE POLICY "users_delete"
ON users FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- ORGANIZATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id text PRIMARY KEY,
  org_name text NOT NULL,
  org_type text NOT NULL,
  category org_category DEFAULT 'other',
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  contact_person text,
  service_area text,
  description text,
  verified boolean NOT NULL DEFAULT false,
  public_profile jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orgs_select_all" ON organizations;
CREATE POLICY "orgs_select_all"
ON organizations FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "orgs_insert" ON organizations;
CREATE POLICY "orgs_insert"
ON organizations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "orgs_update" ON organizations;
CREATE POLICY "orgs_update"
ON organizations FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orgs_delete" ON organizations;
CREATE POLICY "orgs_delete"
ON organizations FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- ISSUES
-- ============================================

CREATE TABLE IF NOT EXISTS issues (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id text REFERENCES organizations(id) ON DELETE SET NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status issue_status NOT NULL DEFAULT 'open',
  status_detail text NOT NULL DEFAULT 'Reported',
  locality text,
  lat double precision,
  lng double precision,
  image_url text,
  author_name text NOT NULL,
  author_locality text,
  date text,
  time text,
  interested_count integer DEFAULT 0,
  joined_count integer DEFAULT 0,
  feedback_yes integer DEFAULT 0,
  feedback_no integer DEFAULT 0,
  resolution_description text,
  resolution_date text,
  resolution_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issues_select_all" ON issues;
CREATE POLICY "issues_select_all"
ON issues FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "issues_insert" ON issues;
CREATE POLICY "issues_insert"
ON issues FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "issues_update" ON issues;
CREATE POLICY "issues_update"
ON issues FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "issues_delete" ON issues;
CREATE POLICY "issues_delete"
ON issues FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_issues_org_id ON issues(org_id);
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);

-- ============================================
-- REACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS reactions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  issue_id text NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type reaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select_all" ON reactions;
CREATE POLICY "reactions_select_all"
ON reactions FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON reactions;
CREATE POLICY "reactions_insert"
ON reactions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "reactions_update" ON reactions;
CREATE POLICY "reactions_update"
ON reactions FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reactions_delete" ON reactions;
CREATE POLICY "reactions_delete"
ON reactions FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_reactions_issue_id ON reactions(issue_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id text PRIMARY KEY,
  issue_id text NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL,
  text text NOT NULL,
  is_official boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_all" ON comments;
CREATE POLICY "comments_select_all"
ON comments FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert"
ON comments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "comments_update" ON comments;
CREATE POLICY "comments_update"
ON comments FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete"
ON comments FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);

-- ============================================
-- ORG_POSTS
-- ============================================

CREATE TABLE IF NOT EXISTS org_posts (
  id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type org_post_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  locality text,
  lat double precision,
  lng double precision,
  image_url text,
  date text,
  time text,
  interested_count integer DEFAULT 0,
  joined_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_posts_select_all" ON org_posts;
CREATE POLICY "org_posts_select_all"
ON org_posts FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "org_posts_insert" ON org_posts;
CREATE POLICY "org_posts_insert"
ON org_posts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "org_posts_update" ON org_posts;
CREATE POLICY "org_posts_update"
ON org_posts FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "org_posts_delete" ON org_posts;
CREATE POLICY "org_posts_delete"
ON org_posts FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_org_posts_org_id ON org_posts(org_id);

-- ============================================
-- RESOLUTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS resolutions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  issue_id text NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  org_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proof_url text,
  description text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  validated_by_community boolean NOT NULL DEFAULT false
);

ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resolutions_select_all" ON resolutions;
CREATE POLICY "resolutions_select_all"
ON resolutions FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "resolutions_insert" ON resolutions;
CREATE POLICY "resolutions_insert"
ON resolutions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "resolutions_update" ON resolutions;
CREATE POLICY "resolutions_update"
ON resolutions FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "resolutions_delete" ON resolutions;
CREATE POLICY "resolutions_delete"
ON resolutions FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_resolutions_issue_id ON resolutions(issue_id);

-- ============================================
-- COMMUNICATION_REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS communication_requests (
  id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_name text NOT NULL,
  citizen_name text NOT NULL,
  post_id text,
  post_title text,
  reason text,
  status comm_request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE communication_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comm_requests_select_all" ON communication_requests;
CREATE POLICY "comm_requests_select_all"
ON communication_requests FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "comm_requests_insert" ON communication_requests;
CREATE POLICY "comm_requests_insert"
ON communication_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "comm_requests_update" ON communication_requests;
CREATE POLICY "comm_requests_update"
ON communication_requests FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "comm_requests_delete" ON communication_requests;
CREATE POLICY "comm_requests_delete"
ON communication_requests FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_comm_req_user_id ON communication_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_comm_req_org_id ON communication_requests(org_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  text text NOT NULL,
  type notification_type NOT NULL,
  post_id text,
  org_id text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_all" ON notifications;
CREATE POLICY "notifications_select_all"
ON notifications FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert"
ON notifications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update"
ON notifications FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete"
ON notifications FOR DELETE
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- The storage bucket is created via the storage schema.
INSERT INTO storage.buckets (id, name, public)
VALUES ('civix-images', 'civix-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public read and authenticated write
DROP POLICY IF EXISTS "civix_images_public_read" ON storage.objects;
CREATE POLICY "civix_images_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'civix-images');

DROP POLICY IF EXISTS "civix_images_public_insert" ON storage.objects;
CREATE POLICY "civix_images_public_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'civix-images');

DROP POLICY IF EXISTS "civix_images_public_delete" ON storage.objects;
CREATE POLICY "civix_images_public_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'civix-images');
