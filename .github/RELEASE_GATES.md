# Release Gates & Guardrails

**Purpose**: Automated safety checks to prevent bad releases.

---

## GATE 1: No Uncommitted Changes

### Purpose
Ensure all code is committed and tracked before release.

### Check
```bash
git status
```

### Validation
```bash
# Run this before starting release
if [ -z "$(git status --porcelain)" ]; then
  echo "✓ PASS: Clean working tree"
else
  echo "✗ FAIL: Uncommitted changes detected"
  git status
  exit 1
fi
```

### What counts as uncommitted
- ❌ Modified files (tracked but not staged)
- ❌ Untracked files (new files not added)
- ❌ Staged but uncommitted changes
- ✅ Commits waiting to be pushed (OK, will be pushed in step 6)

### Fix
```bash
# Option 1: Commit your changes
git add .
git commit -m "message"

# Option 2: Stash and discard
git stash drop

# Option 3: Undo specific files
git checkout -- src/file.ts
```

---

## GATE 2: TypeScript Compilation

### Purpose
Ensure no type errors before production.

### Check
```bash
npx tsc --noEmit
```

### Validation
```bash
# Exit code 0 = success, non-zero = failure
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✓ PASS: TypeScript compilation clean"
else
  echo "✗ FAIL: TypeScript errors detected"
  exit 1
fi
```

### Common errors
- `Type 'string' is not assignable to type 'X'` → Use literal types or type assertion
- `Property 'X' does not exist on type 'Y'` → Check object interface
- `Argument of type 'X' is not assignable to parameter of type 'Y'` → Fix function call

### Fix
```bash
# Review error
npx tsc --noEmit

# Edit file
nano src/path/to/file.ts

# Re-test
npx tsc --noEmit
```

---

## GATE 3: All Tests Pass

### Purpose
Ensure functionality works as expected before release.

### Checks
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Combined (smoke test)
npm run test:smoke
```

### Validation
```bash
# All tests must pass
npm run test:smoke
if [ $? -eq 0 ]; then
  echo "✓ PASS: All tests passing"
else
  echo "✗ FAIL: Test failures detected"
  exit 1
fi
```

### Test coverage
- Unit tests: 8 backend tests (providers, quotes, timeouts, live API)
- E2E tests: 7 corridor page tests

### Fix
```bash
# Review error
npm run test:smoke

# Debug specific test
npm run test -- --reporter=verbose

# Fix issue, re-test
npm run test:smoke
```

---

## GATE 4: Deep Test Validation

### Purpose
Catch edge cases and data integrity issues before production.

### Check
```bash
npm run test:deep
```

### Validation
```bash
# Deep test must complete without HIGH severity issues
npm run test:deep
if [ $? -eq 0 ]; then
  echo "✓ PASS: Deep test validation complete"
  cat DEEP_TEST_REPORT.md | grep "HIGH"
  if [ $? -eq 1 ]; then
    echo "✓ PASS: No HIGH severity risks found"
  else
    echo "✗ FAIL: HIGH severity risks detected"
    exit 1
  fi
else
  echo "✗ FAIL: Deep test execution failed"
  exit 1
fi
```

### What it tests
- PHASE 1: TypeScript strict compilation
- PHASE 2: Runtime edge cases (NaN, empty, very large amounts)
- PHASE 3: Data integrity (ranking, calculations, capabilities)
- PHASE 4: Telemetry & analytics (non-blocking, PII safety)
- PHASE 5: Routing & SEO (all routes, duplicates)
- PHASE 6: PWA & installability (offline, manifest, install)

### Duration
~5-10 minutes

### Fix
```bash
# Review report
cat DEEP_TEST_REPORT.md

# Find HIGH severity issues
grep -A 5 "HIGH" DEEP_TEST_REPORT.md

# Fix identified issues
nano src/path/to/file.ts

# Re-test
npm run test:deep
```

---

## GATE 5: Production Build

### Purpose
Ensure code builds successfully for production deployment.

### Check
```bash
npm run build
```

### Validation
```bash
# Build must succeed
npm run build
if [ $? -eq 0 ]; then
  echo "✓ PASS: Production build successful"
  if [ -d ".next" ]; then
    echo "✓ PASS: Build artifacts generated"
  else
    echo "✗ FAIL: Build artifacts missing"
    exit 1
  fi
else
  echo "✗ FAIL: Build failed"
  exit 1
fi
```

### Common build failures
- TypeScript errors (check: `npx tsc --noEmit`)
- Missing environment variables (check: `.env.local`)
- Module import errors (check: file paths)
- CSS/asset issues (check: public directory)

### Fix
```bash
# Review error
npm run build

# Check TypeScript
npx tsc --noEmit

# Check environment
cat .env.local

# Fix issue, re-test
npm run build
```

---

## AUTOMATED GATE SCRIPTS

### Pre-Release Check Script

Save as `.github/scripts/pre-release-check.sh`:

```bash
#!/bin/bash
set -e

echo "====== RELEASE GATE CHECKS ======"
echo ""

# Gate 1: No uncommitted changes
echo "Gate 1: Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
  echo "✗ FAIL: Uncommitted changes detected"
  git status
  exit 1
fi
echo "✓ PASS: Clean working tree"
echo ""

# Gate 2: TypeScript compilation
echo "Gate 2: Running TypeScript compilation..."
if ! npx tsc --noEmit; then
  echo "✗ FAIL: TypeScript errors detected"
  exit 1
fi
echo "✓ PASS: TypeScript clean"
echo ""

# Gate 3: All tests
echo "Gate 3: Running all tests..."
if ! npm run test:smoke; then
  echo "✗ FAIL: Tests failed"
  exit 1
fi
echo "✓ PASS: All tests passing"
echo ""

# Gate 4: Deep test
echo "Gate 4: Running deep test validation..."
if ! npm run test:deep; then
  echo "✗ FAIL: Deep test failed"
  exit 1
fi

# Check for HIGH severity risks
if grep -q "HIGH" DEEP_TEST_REPORT.md; then
  echo "✗ FAIL: HIGH severity risks detected"
  grep -A 5 "HIGH" DEEP_TEST_REPORT.md
  exit 1
fi
echo "✓ PASS: Deep test validation passed"
echo ""

# Gate 5: Production build
echo "Gate 5: Running production build..."
if ! npm run build; then
  echo "✗ FAIL: Build failed"
  exit 1
fi

if [ ! -d ".next" ]; then
  echo "✗ FAIL: Build artifacts missing"
  exit 1
fi
echo "✓ PASS: Production build successful"
echo ""

echo "====== ALL GATES PASSED ======"
echo "Ready for release!"
```

### Run pre-release check

```bash
chmod +x .github/scripts/pre-release-check.sh
.github/scripts/pre-release-check.sh
```

---

## CI/CD PIPELINE GATES

### GitHub Actions Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release Validation

on:
  pull_request:
    branches:
      - main

jobs:
  release-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # Gate 2: TypeScript
      - name: TypeScript Compilation
        run: npx tsc --noEmit
      
      # Gate 3: Tests
      - name: Run Tests
        run: npm run test:smoke
      
      # Gate 5: Build
      - name: Production Build
        run: npm run build
      
      # Upload deep test report if exists
      - name: Upload Deep Test Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: deep-test-report
          path: DEEP_TEST_REPORT.md
```

---

## BLOCKING vs NON-BLOCKING

### BLOCKING (must pass, release fails if not)
- Gate 1: No uncommitted changes
- Gate 2: TypeScript compilation
- Gate 3: All tests pass
- Gate 5: Production build succeeds

### NON-BLOCKING (should review, but won't fail release)
- Gate 4: Deep test HIGH severity risks
  - Will prevent merge if found
  - But can be addressed after release if urgent

---

## OVERRIDE PROCEDURE

### Emergency Hotfix Release

If all gates fail but critical bug needs urgent fix:

```bash
# 1. Identify minimum fix
# 2. Make ONLY that change
# 3. Get peer review approval
# 4. Document why each gate failed
# 5. Plan remediation after release
# 6. Tag as hotfix (vX.Y.Z-hotfix)
```

**⚠️ Use sparingly - indicates process failure somewhere**

---

## MONITORING GATES

### Health Check Before Release

```bash
# 1. Clean build from scratch
rm -rf node_modules .next
npm ci
npm run build

# 2. Run all tests fresh
npm run test:smoke

# 3. Run deep validation
npm run test:deep

# 4. Manual smoke test
# Open http://localhost:3000
# Click through major corridors
# Check console for errors
```

---

## TROUBLESHOOTING GATES

**Q: Gate 1 fails but I only modified local .env**

A: That's OK if `.env` is in `.gitignore`. Just verify:
```bash
git status | grep ".env"
# Should show nothing
```

**Q: Gate 2 fails with type errors that look fine**

A: TypeScript cache issue:
```bash
npm run build -- --no-cache
npx tsc --noEmit
```

**Q: Gate 3 fails on one test but it passes locally**

A: Environment difference:
```bash
npm ci  # Clean install
npm run test -- --reporter=verbose
```

**Q: Gate 5 build fails but dev server works**

A: Production vs development mode:
```bash
npm run build  # Check detailed error
npx tsc --noEmit  # Check types
cat .env.production  # Check env
```

---

## SUCCESS CRITERIA

All 5 gates passing = safe to release

```
✓ Gate 1: No uncommitted changes
✓ Gate 2: TypeScript compilation
✓ Gate 3: All tests pass
✓ Gate 4: Deep test validated
✓ Gate 5: Production build successful

→ RELEASE APPROVED
```
