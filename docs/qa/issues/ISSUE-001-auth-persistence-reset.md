# ISSUE-001: Users are forced to re-register after backend restart

Labels: bug, severity:major
Milestone: Sprint 1 Submission

**Component:** Authentication service (users storage)
**Severity:** major
**Steps to reproduce:**
1. Start backend and register a new account.
2. Stop backend process.
3. Delete or reset runtime file by environment cleanup.
4. Restart backend and attempt login with same account.

**Expected:** Existing user account remains available across normal restarts.
**Actual:** Account may be unavailable if runtime data file is reset or missing.

**Environment:** Windows 11, PowerShell, backend local run
