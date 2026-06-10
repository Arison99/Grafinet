# ISSUE-005: Demo fallback only supports a few fixed IPs

Labels: enhancement, severity:minor
Milestone: Sprint 1 Submission

**Component:** MMDB fallback behavior
**Severity:** minor
**Steps to reproduce:**
1. Start backend without MMDB data files.
2. Query IP addresses not in fallback set.
3. Observe lookup response.

**Expected:** Better fallback coverage or clearer user guidance when data is unavailable.
**Actual:** Only a small fixed set of IPs resolves in fallback mode.

**Environment:** Windows 11, local FastAPI backend without MMDB files
