# Git Commands Plan for Assignment Requirements

Use this flow to satisfy:
- 10 meaningful commits
- feature-ui branch
- feature-enhancement branch
- PR merge flow into main
- one merge conflict with documentation

## 0) Safety checkpoint
Run these first:

git status --short
git branch --all

## 1) Ensure main branch exists
If your default branch is dev, create main from current dev history:

git switch dev
git switch -c main

If main already exists, just switch:

git switch main

## 2) Keep only UI files on feature-ui and commit incrementally
Switch to feature-ui:

git switch feature-ui

Stage and commit UI/auth screen work:

git add frontend/src/components/AuthForm.jsx frontend/src/pages/Home.jsx frontend/src/styles.css
git commit -m "Implemented signup/login UI with session state and logout controls"

Stage and commit frontend API wiring:

git add frontend/src/services/api.js
git commit -m "Added frontend API client methods for auth, token headers, and logout"

Stage and commit frontend project ignore files if present:

git add frontend/.gitignore
git commit -m "Added frontend gitignore for node modules and build artifacts"

Push feature-ui:

git push -u origin feature-ui

## 3) Move backend and test work to feature-enhancement
If backend/test changes are still unstaged in your working tree, continue from the same tree.
If not, make the equivalent changes directly on feature-enhancement.

Switch from main and create feature-enhancement:

git switch main
git switch -c feature-enhancement

Commit backend auth model and service:

git add backend/app/models/auth_model.py backend/app/services/auth_service.py backend/app/main_state.py backend/app/core/config.py backend/requirements.txt
git commit -m "Added backend authentication models, token lifecycle, and config wiring"

Commit backend auth/dependency routes:

git add backend/app/api/deps.py backend/app/api/routes/auth.py backend/app/api/routes/ip.py backend/app/api/routes/map.py backend/app/main.py
git commit -m "Protected lookup routes with bearer auth and added signup/login/logout endpoints"

Commit backend test dependencies and ignores:

git add backend/requirements-dev.txt backend/.gitignore .gitignore
git commit -m "Added test dependencies and updated ignore rules for runtime artifacts"

Commit automated tests:

git add tests/backend/test_auth_and_protected_routes.py tests/README.md
git commit -m "Added automated tests for auth flow and protected endpoint authorization"

Commit documentation evidence and issue pack:

git add docs/sprint-1/progress.md docs/sprint-1/git-commands-plan.md docs/qa/issues
git commit -m "Documented sprint progress and created issue/milestone drafts for submission evidence"

Push feature-enhancement:

git push -u origin feature-enhancement

## 4) Create Pull Requests
If GitHub CLI is installed:

gh pr create --base main --head feature-ui --title "Feature UI: auth and session UX" --body "Implements UI authentication flow and token-aware frontend API integration."
gh pr create --base main --head feature-enhancement --title "Feature Enhancement: backend auth protection and tests" --body "Adds protected APIs, logout revocation, tests, and documentation artifacts."

If GitHub CLI is not installed:
- Open repository in browser
- Create PR from feature-ui to main
- Create PR from feature-enhancement to main

## 5) Create one merge conflict intentionally (for assignment requirement)
After first PR is merged, do this:

git switch main
git pull

Create conflict branch A:

git switch -c conflict-a

Edit README.md in the same section line used by branch B, then:

git add README.md
git commit -m "Updated README usage wording from conflict-a"
git push -u origin conflict-a

Create conflict branch B from main:

git switch main
git switch -c conflict-b

Edit the exact same README.md lines with different text, then:

git add README.md
git commit -m "Updated README usage wording from conflict-b"
git push -u origin conflict-b

Merge conflict-a PR first, then merge conflict-b PR and resolve conflict in GitHub editor or local merge.

## 6) README conflict resolution note
Add a section in README.md titled:
- Merge Conflict Resolution Process

Include:
1. Branch names used
2. File with conflict
3. Conflict markers observed
4. Final resolution decision
5. Verification steps after merge

## 7) Suggested commit count map (10 total minimum)
1. Implemented signup/login UI with session state and logout controls
2. Added frontend API client methods for auth, token headers, and logout
3. Added frontend gitignore for node modules and build artifacts
4. Added backend authentication models, token lifecycle, and config wiring
5. Protected lookup routes with bearer auth and added signup/login/logout endpoints
6. Added test dependencies and updated ignore rules for runtime artifacts
7. Added automated tests for auth flow and protected endpoint authorization
8. Documented sprint progress and created issue/milestone drafts for submission evidence
9. Updated README usage wording from conflict-a
10. Updated README usage wording from conflict-b
