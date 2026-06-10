# ISSUE-003: Authentication endpoints are not rate-limited

Labels: bug, severity:major
Milestone: Sprint 1 Submission

**Component:** Auth API hardening
**Severity:** major
**Steps to reproduce:**
1. Send repeated login attempts with incorrect passwords.
2. Observe responses from /api/auth/login.
3. Continue attempts without backoff.

**Expected:** API should throttle repeated auth attempts to reduce brute-force risk.
**Actual:** Requests are accepted continuously without anti-abuse controls.

**Environment:** Windows 11, local API, scripted request loop
