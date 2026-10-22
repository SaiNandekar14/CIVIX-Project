/*
# Fix comments FK constraint

The comments table had a FK to users(id), but organization comments come from
organizations, not users. We need to allow both citizen and org authors.

## Changes
1. Drop the comments_user_id_fkey constraint
2. The user_id column in comments now stores either a user id or org id (text, no FK)
*/

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
