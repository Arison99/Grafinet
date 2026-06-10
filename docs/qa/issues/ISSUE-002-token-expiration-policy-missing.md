# ISSUE-002: No explicit token expiration policy

Labels: bug, severity:major
Milestone: Sprint 1 Submission

**Component:** Authentication token lifecycle
**Severity:** major
**Steps to reproduce:**
1. Login and receive bearer token.
2. Keep session active for extended period.
3. Continue calling protected endpoints with same token.

**Expected:** Token should have clear expiration or rotation policy.
**Actual:** Token remains valid until explicit logout or replacement.

**Environment:** Windows 11, Chrome, local frontend and backend
