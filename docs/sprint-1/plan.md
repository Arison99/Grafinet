# Grafinet Sprint 1 Plan

## Sprint Window
- Start: 2026-06-09
- End: 2026-06-11 (before assignment cutoff)
- Goal: Deliver a demonstrable Internet Routing Visualization System and complete required GitHub evolution evidence for submission.

## In-Scope For This Sprint
- Backend API for IP lookup, map point response, and simple anomaly detection.
- Frontend map-based IP lookup UI with ASN/prefix display and anomaly panel.
- Repository hygiene and assignment compliance artifacts (README, LICENSE, CONTRIBUTING, issues, branches, PR evidence).
- Documentation for report and demo readiness.

## Out of Scope
- Advanced BGP path simulation.
- Large-scale production hardening.
- Complex ML anomaly detection.

## Priority Tasks

### P0 - Must Ship
1. Backend core endpoints
- Build and verify endpoints:
  - `GET /api/ip/{ip}`
  - `GET /api/map/point/{ip}`
- Integrate MMDB loader for prefix + ASN databases.
- Return stable JSON contract for frontend.

Success criteria:
- Valid public IP returns `found: true` with ASN and prefix data.
- Unknown/invalid IP returns graceful response (`found: false` or clear validation error).
- API starts without runtime import/config errors.

2. Rule-based anomaly service
- Implement anomaly scoring using documented rules:
  - missing ASN
  - bogon prefix
  - invalid RPKI
- Expose anomaly result in IP lookup response or dedicated service layer call.

Success criteria:
- At least 3 test inputs produce expected score/reason combinations.
- Response includes `anomaly`, `score`, and `reasons` fields.

3. Frontend map workflow
- Implement IP search input + submit action.
- Fetch backend lookup and map-point data.
- Plot marker on Leaflet map for resolved IP.
- Show ASN metadata and prefix in popup/panel.

Success criteria:
- User can enter an IP and see result within one interaction.
- Marker appears only when coordinates are available.
- Empty/error states are visible and non-breaking.

4. Assignment repository compliance
- Ensure these files exist and are complete:
  - README.md
  - LICENSE
  - CONTRIBUTING.md
- README includes:
  - project title
  - description
  - install instructions
  - usage instructions
  - contributors section

Success criteria:
- All required files present and readable in repository root.
- README content matches assignment rubric.

### P1 - High Value
5. GitHub evolution workflow evidence
- Create feature branches:
  - `feature-ui`
  - `feature-enhancement`
- Use PR flow to merge both into `main`.
- Intentionally resolve/document at least one merge conflict in README.
- Maintain at least 10 meaningful incremental commits.

Success criteria:
- Branch history clearly shows separated feature development.
- At least one conflict resolution is documented with steps.
- Commit messages are descriptive and specific.

6. Issue and milestone management
- Create at least 5 issues (bug, feature, refactor, docs mix).
- Create 1 milestone and assign issues.
- Close at least 3 issues via commit/PR references.

Success criteria:
- Issue board reflects realistic software evolution lifecycle.
- Milestone progress can be shown in screenshots.

### P2 - Nice to Have
7. Report support pack
- Prepare report outline aligned to assignment sections.
- Capture screenshots for:
  - commit history
  - branches
  - pull requests
  - issues
  - milestone
- Include attribution text: "Internet information provided by IPNetDB.com".

Success criteria:
- Student can compile 1500-2000 word report quickly from prepared notes.
- All submission artifacts are ready before deadline.

## Work Breakdown by Role
- Frontend dev: map UI, search UX, API wiring, result rendering.
- Backend dev: FastAPI routes, MMDB loader, service layer, anomaly integration.
- QA: API response checks, UI behavior checks, error-path checks.
- DevOps/Git owner: branches, commits, PRs, issues, milestone, evidence screenshots.
- Documentation owner: README updates, conflict resolution section, report draft support.

## Suggested Execution Order
1. Backend endpoint skeleton and response contract.
2. Frontend integration against contract.
3. Anomaly service integration + UX exposure.
4. Branch/PR workflow and merge conflict documentation.
5. Issues/milestone creation and closure linking.
6. Final evidence capture and report writing.

## Risks and Mitigations
- Risk: MMDB field names may differ from assumptions.
- Mitigation: Add defensive `get()` access and explicit fallback values.

- Risk: Frontend expects lat/lon but backend may not always provide geodata.
- Mitigation: Conditional marker rendering and user-facing "location unavailable" message.

- Risk: Assignment penalties from missing GitHub process evidence.
- Mitigation: Track checklist daily and capture screenshots as soon as each artifact is complete.

## QA Checklist
- API starts and responds for valid/invalid IP queries.
- UI does not crash on failed lookups.
- Anomaly object is always structurally consistent.
- README includes required assignment sections.
- Branches, PRs, issues, and milestone are visible and populated.

## Definition of Done
- Core backend + frontend demo works end-to-end.
- GitHub evolution artifacts satisfy assignment rubric.
- Required screenshots captured.
- Report draft can be completed from available project evidence.

## Ready-to-Use Agent Prompts

### Dev Team Prompt
Build Sprint 1 for Grafinet. Implement FastAPI routes for IP lookup and map point retrieval using MMDB-backed services, add rule-based anomaly scoring, and connect a React + Leaflet frontend flow that lets users search an IP and visualize ASN/prefix results on a map. Use incremental commits with clear messages, work via feature-ui and feature-enhancement branches, and prepare PRs into main.

### QA Prompt
Run a focused validation pass for Grafinet Sprint 1. Verify API behavior for valid and invalid IP inputs, confirm anomaly response shape and logic, validate map rendering and error handling in the frontend, and produce a concise test evidence note with pass/fail status and reproducible issues.

### GitHub Process Prompt
Prepare assignment-compliant GitHub evidence: create at least 5 issues and 1 milestone, close at least 3 issues via commit or PR references, ensure both feature branches merge through PRs, and document one merge-conflict resolution in README.

## Sprint Acceptance Gate
- Demo gate: Live lookup flow visible in frontend and backed by functioning API.
- Process gate: Branching, PRs, issues, and milestone all present as rubric evidence.
- Documentation gate: README complete and attribution included.
