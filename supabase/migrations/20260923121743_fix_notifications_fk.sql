/*
# Fix notifications user_id FK

The notifications table user_id can reference either users or organizations.
Remove the strict FK if it exists (notifications has no FK to users currently,
but making sure user_id is just text with no constraint).
*/
-- No FK exists on notifications.user_id, nothing to do.
SELECT 1;
