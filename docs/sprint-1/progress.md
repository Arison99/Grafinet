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

### Phase 10: Frontend Guidance UX (Onboarding + Recommendations)
Status: Complete

Completed:
- Added first-run onboarding modal explaining Grafinet purpose and usage flow.
- Added persistent onboarding preference so users can hide repeat tour prompts.
- Added contextual recommendation panel to reduce user confusion with:
  - quick lookup actions for known resolver IPs
  - first-run guidance when no lookup has run yet
  - targeted recommendations for error and no-result states
  - risk guidance based on IPNetDB signals (RPKI invalid, bogon prefix, anomaly reasons)
- Added "How it works" and "View onboarding" entry points for re-opening guidance anytime.

Validation:
- Frontend builds successfully after new component and styling integration.

### Phase 11: Tailwind Migration and Professional UI Refresh
Status: Complete

Completed:
- Migrated frontend styling to Tailwind CSS with PostCSS pipeline.
- Added Tailwind config and content scanning for React source.
- Replaced legacy global stylesheet rules with Tailwind base/utilities.
- Refactored UI components to utility classes:
  - Home page shell, header, session status, responsive content grid
  - Auth form, IP search bar, ASN detail panel
  - Onboarding modal and guided recommendation panel
  - Map shell sizing and responsive layout polish
- Upgraded visual quality with cleaner spacing, stronger hierarchy, and professional card/button treatment.

Validation:
- Frontend production build passed after Tailwind migration.

### Phase 12: Multi-Page Frontend Expansion
Status: Complete

Completed:
- Added React Router navigation with top-level routes for:
  - Overview page
  - Workspace page
  - Guide page
  - IPNetDB data reference page
  - Not-found fallback page
- Added reusable top navigation bar for improved app discoverability.
- Added new professional content pages to support onboarding and user understanding before entering the live workspace.

Validation:
- Frontend build passed after route and page integration.

### Phase 13: Premium UI Polish (Motion + Iconography)
Status: Complete

Completed:
- Added lightweight page-level animation utilities (fade-in and fade-up) with stagger timing.
- Added iconography across navigation, landing, guide, data reference, onboarding, and 404 pages.
- Refined CTA buttons and visual cues to improve scanning and perceived quality.
- Kept motion subtle and performant to preserve readability and avoid distraction.

Validation:
- Frontend production build passed after animation and icon enhancements.
