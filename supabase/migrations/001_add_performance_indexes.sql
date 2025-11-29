-- Migration: Add Performance Indexes
-- Description: Creates indexes on frequently queried columns to improve database performance
-- Created: 2025-11-30

-- ============================================
-- ATTENDANCE TABLE INDEXES
-- ============================================

-- Index on session_id for faster session attendance queries
-- Used by: /api/sessions/[id]/attendance, /api/cca-admin/[id]/analytics
CREATE INDEX IF NOT EXISTS idx_attendance_session_id
ON attendance(session_id);

-- Index on event_id for faster event attendance queries
-- Used by: /api/events/[id]/attendance, /api/cca-admin/[id]/analytics
CREATE INDEX IF NOT EXISTS idx_attendance_event_id
ON attendance(event_id);

-- Index on user_id for faster user-specific queries
-- Used by: Various attendance queries filtering by user
CREATE INDEX IF NOT EXISTS idx_attendance_user_id
ON attendance(user_id);

-- Composite index for session attendance with status filtering
-- Used by: Analytics queries that filter by session and attended status
CREATE INDEX IF NOT EXISTS idx_attendance_session_attended
ON attendance(session_id, attended);

-- Composite index for event attendance with status filtering
-- Used by: Analytics queries that filter by event and attended status
CREATE INDEX IF NOT EXISTS idx_attendance_event_attended
ON attendance(event_id, attended);

-- ============================================
-- CCA_MEMBERSHIP TABLE INDEXES
-- ============================================

-- Index on cca_id for faster CCA member lookups
-- Used by: /api/memberships, /api/cca-admin/[id]/members
CREATE INDEX IF NOT EXISTS idx_cca_membership_cca_id
ON cca_membership(cca_id);

-- Index on user_id for faster user membership lookups
-- Used by: /api/memberships, user enrollment queries
CREATE INDEX IF NOT EXISTS idx_cca_membership_user_id
ON cca_membership(user_id);

-- Composite index for unique membership checks and queries
-- Used by: Preventing duplicate memberships, combined filters
CREATE INDEX IF NOT EXISTS idx_cca_membership_cca_user
ON cca_membership(cca_id, user_id);

-- ============================================
-- SESSIONS TABLE INDEXES
-- ============================================

-- Index on cca_id for faster CCA session queries
-- Used by: /api/sessions, /api/cca-admin/[id]/analytics
CREATE INDEX IF NOT EXISTS idx_sessions_cca_id
ON sessions(cca_id);

-- Index on date for chronological queries and sorting
-- Used by: Analytics trend data, session listings
CREATE INDEX IF NOT EXISTS idx_sessions_date
ON sessions(date);

-- Composite index for CCA sessions ordered by date
-- Used by: Fetching all sessions for a CCA in chronological order
CREATE INDEX IF NOT EXISTS idx_sessions_cca_date
ON sessions(cca_id, date);

-- ============================================
-- EVENTS TABLE INDEXES
-- ============================================

-- Index on cca_id for faster CCA event queries
-- Used by: /api/events, /api/cca-admin/[id]/analytics
CREATE INDEX IF NOT EXISTS idx_events_cca_id
ON events(cca_id);

-- Index on date for chronological queries and sorting
-- Used by: Analytics trend data, event listings
CREATE INDEX IF NOT EXISTS idx_events_date
ON events(date);

-- Composite index for CCA events ordered by date
-- Used by: Fetching all events for a CCA in chronological order
CREATE INDEX IF NOT EXISTS idx_events_cca_date
ON events(cca_id, date);

-- ============================================
-- STUDENT_DETAILS TABLE INDEXES
-- ============================================

-- Index on user_id for faster student lookup by user
-- Used by: Attendance enrichment, member lookups
CREATE INDEX IF NOT EXISTS idx_student_details_user_id
ON student_details(user_id);

-- Index on student_id for faster student ID searches
-- Used by: Student identification and searches
CREATE INDEX IF NOT EXISTS idx_student_details_student_id
ON student_details(student_id);

-- ============================================
-- CCA_ADMIN_DETAILS TABLE INDEXES
-- ============================================

-- Index on user_id for faster admin verification
-- Used by: Authorization checks across all admin routes
CREATE INDEX IF NOT EXISTS idx_cca_admin_details_user_id
ON cca_admin_details(user_id);

-- Index on cca_id for finding CCA admins
-- Used by: Admin listing and verification
CREATE INDEX IF NOT EXISTS idx_cca_admin_details_cca_id
ON cca_admin_details(cca_id);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- Expected improvements:
-- 1. Attendance queries: 2-5x faster with session/event indexes
-- 2. Membership lookups: 5-10x faster with composite indexes
-- 3. Analytics queries: 3-5x faster with optimized grouping and indexes
-- 4. Authorization checks: 2x faster with admin indexes
--
-- Index maintenance:
-- - Indexes are automatically maintained by PostgreSQL
-- - May slow down INSERT/UPDATE operations slightly (typically < 5%)
-- - Trade-off is worth it for read-heavy workloads
--
-- To verify indexes are being used, run:
-- EXPLAIN ANALYZE SELECT ... your query here ...
-- Look for "Index Scan" instead of "Seq Scan" in the output
