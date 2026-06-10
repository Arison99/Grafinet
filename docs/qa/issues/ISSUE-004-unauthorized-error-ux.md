# ISSUE-004: Session-expired UX does not differentiate all auth failures

Labels: bug, severity:minor
Milestone: Sprint 1 Submission

**Component:** Frontend authentication messaging
**Severity:** minor
**Steps to reproduce:**
1. Login to obtain token.
2. Trigger auth failure through malformed Authorization header or invalid scheme.
3. Observe frontend message behavior.

**Expected:** User should get precise guidance for each auth failure type.
**Actual:** Frontend uses a generic session-expired flow for multiple auth error cases.

**Environment:** Windows 11, Chrome latest, React frontend
