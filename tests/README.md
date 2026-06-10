# Test Suite

## Backend Tests

Run from backend directory:

1. Activate virtual environment
2. Install dev test dependencies:
   - pip install -r requirements-dev.txt
3. Execute tests:
   - python -m pytest ..\\tests\\backend -q

Covered scenarios:
- Signup/login/logout flow
- Protected endpoint access control
- Invalid login handling
