-- Exclusion-constraint backstop test (direct inserts bypassing the API).
-- Usage: replace {ROOM}, {U1}, {U2} with real ids, then:
--   psql -d vanprastha -v ON_ERROR_STOP=0 -f scripts/constraint-test.sql
-- Expected: insert 1 OK, insert 2 FAILS (bookings_no_overlap), inserts 3+4 OK.
INSERT INTO bookings (id, "userId", "roomId", "checkIn", "checkOut", guests, "totalAmount", status, "createdAt", "updatedAt")
VALUES ('race-test-1', '{U1}', '{ROOM}', '2026-09-01 00:00:00', '2026-09-03 00:00:00', 2, 24000, 'PENDING', now(), now());

\echo '=== insert 2 (overlapping PENDING): EXPECTED TO FAIL ==='
INSERT INTO bookings (id, "userId", "roomId", "checkIn", "checkOut", guests, "totalAmount", status, "createdAt", "updatedAt")
VALUES ('race-test-2', '{U2}', '{ROOM}', '2026-09-02 00:00:00', '2026-09-04 00:00:00', 2, 24000, 'PENDING', now(), now());

\echo '=== insert 3 (non-overlapping dates): EXPECTED TO SUCCEED ==='
INSERT INTO bookings (id, "userId", "roomId", "checkIn", "checkOut", guests, "totalAmount", status, "createdAt", "updatedAt")
VALUES ('race-test-3', '{U2}', '{ROOM}', '2026-10-01 00:00:00', '2026-10-02 00:00:00', 2, 12000, 'PENDING', now(), now());

\echo '=== insert 4 (cancelled, overlapping): EXPECTED TO SUCCEED ==='
INSERT INTO bookings (id, "userId", "roomId", "checkIn", "checkOut", guests, "totalAmount", status, "createdAt", "updatedAt")
VALUES ('race-test-4', '{U2}', '{ROOM}', '2026-09-02 00:00:00', '2026-09-03 00:00:00', 2, 12000, 'CANCELLED', now(), now());

DELETE FROM bookings WHERE id LIKE 'race-test-%';
\echo '=== cleanup done ==='