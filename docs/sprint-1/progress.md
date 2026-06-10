# Sprint 1 Progress

## 2026-06-09

### Phase 1: Project Build Scaffolded
Status: Complete

Completed:
- Implemented FastAPI backend structure with routes, services, models, and startup app.
- Added endpoints:
  - GET /health
  - GET /api/ip/{ip}
  - GET /api/map/point/{ip}
- Implemented rule-based anomaly detection:
  - ASN missing
  - Bogon prefix
  - Invalid RPKI route
- Added resilient MMDB loader with fallback sample data for immediate demo.
- Implemented React + Vite frontend with:
  - IP search form
  - Leaflet map and marker rendering
  - ASN/prefix/anomaly details panel
  - error and no-data states
- Added assignment-required root docs:
  - README.md
  - LICENSE
  - CONTRIBUTING.md
- Added module-level README files for backend and frontend.

Validation:
- Python compile check passed for all backend source files.
- No editor-reported syntax or lint errors in workspace.

Notes:
- MMDB fallback sample IPs currently include 8.8.8.8, 1.1.1.1, and 9.9.9.9.
- Real MMDB files can be dropped into backend/data with names:
  - ipnetdb_prefix.mmdb
  - ipnetdb_asn.mmdb

Next:
- Install dependencies and run both services locally.
- Create feature branches and incremental commits per assignment rubric.
- Prepare GitHub issues, milestone, PR flow, and merge conflict documentation.

### Phase 2: Authentication Added
Status: Complete

Completed:
- Added backend auth service with signup and login logic.
- Added auth API endpoints:
  - POST /api/auth/signup
  - POST /api/auth/login
- Added password hashing and user persistence in backend/data/users.json.
- Added frontend authentication form with signup/login mode toggle.
- Added session handling in UI (login state + logout).
- Gated lookup workflow to authenticated users.

Validation:
- Backend dependency install completed with email validation package.
- Backend compile and import checks passed.
- Auth service functional check passed for signup and login.
- Frontend production build passed with auth UI changes.
Notes:
- Runtime auth data file backend/data/users.json is ignored in .gitignore.

### Phase 3: Token-Protected API Access
Status: Complete

Completed:
- Added bearer-token validation dependency for protected APIs.
- Protected lookup routes with authentication checks:
  - GET /api/ip/{ip}
  - GET /api/map/point/{ip}
- Updated auth service to persist issued tokens and validate incoming tokens.
- Updated frontend API layer to send Authorization header for protected calls.
- Updated frontend lookup flow to use session token and logout on token failure.

Validation:
- Backend compile and token-validation smoke checks passed.
- Frontend production build passed after auth header changes.

### Phase 4: Server-Side Logout Revocation
Status: Complete

Completed:
- Added backend logout endpoint:
  - POST /api/auth/logout
- Added server-side token revocation in auth service.
- Updated frontend logout flow to call backend logout endpoint before clearing local session.

Validation:
- Backend compile check passed after logout endpoint integration.
- Token revocation smoke test passed.
- Frontend production build passed after logout API wiring.

### Phase 5: QA Issue Pack and Automated Tests
Status: Complete

Completed:
- Created assignment-ready issue pack (5 issues) and one milestone draft under docs/qa/issues.
- Added backend automated test suite for authentication and protected routes.
- Added backend test dependencies file.
- Added test execution README.

Validation:
- Backend test dependencies installed successfully.
- Automated tests executed successfully: 3 passed.

### Phase 6: Git Branch and Commit Execution Plan
Status: Complete

Completed:
- Added explicit command-by-command git execution plan for:
  - feature-ui branch commits
  - feature-enhancement branch commits
  - PR creation flow
  - intentional merge conflict demonstration
- Added commit message map to reach assignment minimum commit count.

Reference:
- docs/sprint-1/git-commands-plan.md

### Phase 7: Branch Execution Completed
Status: Complete

Completed:
- Created and populated required branches:
  - feature-ui
  - feature-enhancement
- Created main branch from dev for assignment-compatible PR base.
- Produced meaningful incremental commits across both feature branches.

Validation:
- Working tree is clean after commits.
- Branch list includes dev, main, feature-ui, feature-enhancement.
- Recent commit history confirms backend, auth, testing, and documentation evolution.

### Phase 8: Remote Sync and Repository Cleanup
Status: Complete

Completed:
- Removed oversized MMDB blob from history and force-pushed rewritten branches.
- Removed tracked frontend/node_modules and dist history and force-pushed rewritten branches.

Validation:
- Push operations succeeded after cleanup.
- Largest remaining git object is below GitHub 100MB limit.

### Phase 9: Merge Conflict Demonstration and Resolution
Status: Complete

Completed:
- Created and pushed conflict branches:
  - conflict-a
  - conflict-b
- Merged conflict-a into main.
- Triggered a real README conflict by merging conflict-b.
- Resolved conflict and committed final merged content on main.
- Added "Merge Conflict Resolution Process" section to README.

Validation:
- Main branch updated and pushed after conflict resolution.

Current blocker:
- GitHub CLI auth token is invalid, so PRs cannot be auto-created via gh until re-authenticated.
