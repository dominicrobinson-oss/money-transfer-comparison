# RELEASE BRANCH PROCESS

**Document Version**: 1.0  
**Last Updated**: February 5, 2026  
**Purpose**: Standard operating procedure for creating releases via git branches

---

## QUICK START (TL;DR)

```bash
# 1. Ensure clean working directory
git status

# 2. Create release branch from main
git checkout main
git pull origin main
git checkout -b release/v1.2.3

# 3. Update version
# Edit: package.json
# Update: version to "1.2.3"

# 4. Run all gates
git status                          # No uncommitted changes gate
npx tsc --noEmit                    # TypeScript gate
npm test && npm run test:e2e        # All tests gate
npm run test:deep                   # Deep test gate
npm run build                       # Build gate

# 5. Commit & push
git add package.json
git commit -m "chore: bump version to 1.2.3"
git push origin release/v1.2.3

# 6. Create Pull Request on GitHub
# Title: Release: v1.2.3
# Description: See RELEASE_CHECKLIST.md

# 7. Merge to main (after approval)
git checkout main
git pull origin main
git merge --no-ff release/v1.2.3
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin main
git push origin v1.2.3
git push origin --delete release/v1.2.3
```

---

## STEP-BY-STEP PROCESS

### Step 1: Prepare Main Branch

**Goal**: Start from clean, up-to-date main branch

```bash
# Check current branch
git branch
# Output should show: * main (asterisk = current branch)

# If not on main, switch
git checkout main

# Pull latest changes
git pull origin main
# Output should show: "Already up to date" or list new commits

# Verify clean state
git status
# PASS: "On branch main" + "nothing to commit, working tree clean"
# FAIL: if "Changes not staged" or "Untracked files" shown
```

**If NOT clean**:
```bash
# Stash uncommitted changes temporarily
git stash

# Or discard them (⚠️ be careful)
git checkout -- .

# Then retry git status
```

---

### Step 2: Determine Version Number

Reference [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md#versioning-strategy)

**Decision tree**:
```
Breaking changes (API, schema, algorithm)?
├─ YES → MAJOR version (X.0.0)
└─ NO
   └─ New features (corridors, methods, integrations)?
      ├─ YES → MINOR version (1.Y.0)
      └─ NO
         └─ Bug fixes, improvements?
            ├─ YES → PATCH version (1.1.Z)
            └─ NO → Don't release (nothing changed)
```

**Examples**:
- `1.0.0` → Initial release
- `1.1.0` → Added new corridor
- `1.1.1` → Fixed TypeScript type bug
- `2.0.0` → Changed ranking algorithm (breaking)

---

### Step 3: Create Release Branch

```bash
# Create and checkout release branch
git checkout -b release/v1.2.3

# Verify branch created
git branch
# Output should show: * release/v1.2.3
```

**Branch naming**:
- Format: `release/vX.Y.Z`
- Example: `release/v1.1.0`
- Never use: `release/main`, `release/latest`, or dates

---

### Step 4: Update Version

**File 1**: `package.json`

```bash
# Open and edit
nano package.json
# OR use your editor
code package.json
```

Update the `version` field:
```json
{
  "name": "money-transfer-comparison",
  "version": "1.2.3",
  "description": "Mobile-first GBP→NGN transfer comparison",
  ...
}
```

**Verify change**:
```bash
grep "version" package.json | head -1
# Output should show: "version": "1.2.3"
```

**File 2** (optional): `CHANGELOG.md` or release notes

```markdown
## v1.2.3 - 2026-02-05

### New Features
- Feature 1
- Feature 2

### Bug Fixes
- Fixed issue 1
- Fixed issue 2

### Breaking Changes
None

### Performance
- Improvement 1
```

---

### Step 5: Run All Verification Gates

#### Gate 1: No Uncommitted Changes

```bash
git status
```

**Expected output**:
```
On branch release/v1.2.3

Changes not staged for commit:
  (use "git add <file>..." to update the what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        ...
```

**Action**: Stage version bump
```bash
git add package.json
# OR if you also updated CHANGELOG
git add CHANGELOG.md
```

**Verify after staging**:
```bash
git status
# After git add, changes should appear under "Changes to be committed"
```

#### Gate 2: TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected output**: (no output = success)

**If errors**:
```
src/app/api/compare/route.ts:45:10 - error TS2322: Type 'string' is not assignable to type '"GBP"'.

45   fromCurrency: sendCurrency,
     ~~~~~~~~~~~~~
```

**Action**: Fix the error (do NOT skip TypeScript errors)
```bash
# Edit the file
nano src/app/api/compare/route.ts
# Fix type issue
# Re-test
npx tsc --noEmit
```

#### Gate 3: All Tests Pass

```bash
npm test
```

**Expected output**:
```
✓ tests/smoke.backend.test.ts (8)
  ✓ Provider Management (3)
  ✓ Quote Ranking (2)
  ✓ Timeout Utilities (2)
  ✓ Live Quotes API (1)

Test Files  1 passed (1)
     Tests  8 passed (8)
```

**If tests fail**:
```bash
# Review error output
# Fix the issue
# Re-test
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

**Expected output**:
```
✓ tests/smoke.e2e.test.ts (7)
  ✓ All corridor pages render (7)

Test Files  1 passed (1)
     Tests  7 passed (7)
```

#### Gate 4: Deep Test Validation

```bash
npm run test:deep
```

**Expected output**:
```
PHASE 1: Type & Build Safety .......... ✓ PASS
PHASE 2: Runtime & Edge Cases ........ ✓ PASS
PHASE 3: Data Integrity .............. ✓ PASS
PHASE 4: Telemetry & Analytics ....... ✓ PASS
PHASE 5: Routing & SEO ............... ✓ PASS
PHASE 6: PWA & Installability ........ ✓ PASS

RESULT: ✅ All phases passed
REPORT: DEEP_TEST_REPORT.md (updated)
```

**If DEEP_TEST fails**:
```bash
# Review DEEP_TEST_REPORT.md
cat DEEP_TEST_REPORT.md | grep -A 5 "HIGH"
# Fix identified issues
# Re-run deep test
npm run test:deep
```

#### Gate 5: Production Build

```bash
npm run build
```

**Expected output** (last lines):
```
✓ built in 45.23s

Route (app)                              Size      First Load
┌ ○ / (ISR: 3600 Seconds)              45 B        87.3 kB
├ ○ /gbp-to-ngn (ISR: 3600 Seconds)    12 B        87.3 kB
├ ○ /gbp-to-ghs                         1.2 kB      88.5 kB
...
```

**If build fails**:
```bash
# Review error output
# Common issues:
# - TypeScript errors (check: npx tsc --noEmit)
# - Missing env variables (check: .env.local)
# - Import errors (check: file exists)

# Fix issue and re-test
npm run build
```

---

### Step 6: Commit & Push to Release Branch

```bash
# Stage all changes (should only be version bump)
git add package.json
git add CHANGELOG.md  # if updated

# View what will be committed
git status

# Commit with semantic message
git commit -m "chore: bump version to 1.2.3"

# Verify commit
git log --oneline -n 3
# Output should show your version bump commit at top

# Push to origin
git push origin release/v1.2.3
```

**Expected output**:
```
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Delta compression using 2 threads...
Writing objects: 100% (3/3), 281 bytes | 281.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), reused pack 0 (delta 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local objects.
To github.com:username/money-transfer-comparison.git
 * [new branch]      release/v1.2.3 -> release/v1.2.3
```

---

### Step 7: Create Pull Request

**On GitHub** (web interface):

1. Navigate to repository
2. Click "Pull requests" tab
3. Click "New pull request" button
4. **Base**: `main` (target branch)
5. **Compare**: `release/v1.2.3` (your branch)
6. **Title**: `Release: v1.2.3`
7. **Description**: (copy from template below)

**PR Description Template**:
```markdown
## Release v1.2.3

### What's New
- List of new features or improvements

### Bug Fixes
- List of bugs fixed

### Version Info
- **Previous**: v1.1.2
- **Current**: v1.2.3
- **Type**: MINOR release
- **Checklist**: See RELEASE_CHECKLIST.md

### Verification
- [x] All gates passed (TypeScript, tests, build)
- [x] Deep test validation complete
- [x] No breaking changes
- [x] Documentation updated

### Deployment
Ready for merge to main and immediate production deployment.

See: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
```

8. Click "Create pull request"

**Wait for**:
- [ ] CI/CD pipeline to pass (green checks)
- [ ] Code review approval (if required by team)
- [ ] All conversations resolved

---

### Step 8: Merge to Main

**Option A**: Merge via GitHub web interface

1. On PR page, click "Merge pull request" button
2. Choose merge type: "Create a merge commit" (recommended)
3. Click "Confirm merge"

**Option B**: Merge via command line

```bash
# Switch to main
git checkout main

# Pull latest (important!)
git pull origin main

# Merge release branch (non-fast-forward merge)
git merge --no-ff release/v1.2.3
# This opens editor for commit message (accept default or customize)

# Verify merge
git log --oneline -n 3
# Should show: Merge branch 'release/v1.2.3' into main

# Push to origin
git push origin main
```

---

### Step 9: Create Git Tag

**Command line**:

```bash
# Create annotated tag (recommended)
git tag -a v1.2.3 -m "Release v1.2.3: Add GBP-INR corridor and improve signals"

# Verify tag
git tag -l v1.2.3 -n
# Output: v1.2.3    Release v1.2.3: Add GBP-INR corridor and improve signals

# Push tag to origin
git push origin v1.2.3
```

**Verify push**:
```bash
git ls-remote origin | grep v1.2.3
# Output should show tag
```

---

### Step 10: Cleanup Release Branch

```bash
# Delete local branch
git branch -d release/v1.2.3
# Output: Deleted branch release/v1.2.3

# Delete remote branch
git push origin --delete release/v1.2.3
# Output: To github.com:username/money-transfer-comparison.git
#  - [deleted]         release/v1.2.3
```

**Verify cleanup**:
```bash
git branch
# release/v1.2.3 should NOT appear

git branch -r | grep release
# Should show no release branches
```

---

## TROUBLESHOOTING

### Issue: "Cannot delete branch, it's not fully merged"

**Cause**: Merge conflict or incomplete merge

**Solution**:
```bash
# Check if it's actually merged
git log main | grep "release/v1.2.3"

# If not merged, force delete (use with caution)
git branch -D release/v1.2.3
```

### Issue: "Push rejected, branch is behind"

**Cause**: Someone pushed to main while you were working

**Solution**:
```bash
# Pull latest
git pull origin main

# Resolve any conflicts (if applicable)
# Then retry push
git push origin release/v1.2.3
```

### Issue: "Test failed in CI but passed locally"

**Cause**: Environment difference between local and CI

**Action**:
```bash
# Review CI logs on GitHub
# Check .github/workflows/ for test configuration
# Try to reproduce locally:
npm ci  # Clean install (matches CI environment)
npm test
```

### Issue: "TypeScript errors only appear after pushing"

**Cause**: Different TypeScript version or configuration

**Solution**:
```bash
# Update packages
npm ci
npm update typescript

# Re-test
npx tsc --noEmit
npm test

# Commit changes if different
git add package-lock.json
git commit -m "chore: update dependencies"
git push origin release/v1.2.3
```

---

## ADVANCED SCENARIOS

### Scenario: Hotfix Release (v1.1.1 from v1.1.0)

```bash
# Start from the tagged commit
git checkout v1.1.0

# Create hotfix branch
git checkout -b hotfix/v1.1.1

# Make minimal fix
nano src/lib/quotes/fetchWiseQuote.ts
# ... fix bug ...

# Test thoroughly
npm test
npm run test:deep

# Commit
git add src/lib/quotes/fetchWiseQuote.ts
git commit -m "fix: resolve critical issue in quote fetching"

# Push and create PR to main
git push origin hotfix/v1.1.1
# ... create PR on GitHub ...

# After approval, merge and tag
git checkout main
git pull origin main
git merge --no-ff hotfix/v1.1.1
git tag -a v1.1.1 -m "Hotfix: Critical quote fetching issue"
git push origin main v1.1.1
```

### Scenario: Release Revert (rollback v1.2.3)

```bash
# Check what to revert to
git log --oneline -n 10
# Find the merge commit for v1.2.3

# Revert the entire release
git revert -m 1 <merge-commit-hash>

# This creates a new commit that undoes v1.2.3
# Commit and push
git push origin main

# Create new tag for rollback
git tag -a v1.2.3-reverted -m "Reverted v1.2.3 due to critical issue"
git push origin v1.2.3-reverted
```

### Scenario: Multiple Patches in One Release

```bash
# Create release branch as normal
git checkout -b release/v1.2.0

# Make multiple commits
git add src/app/api/...
git commit -m "feat: add new endpoint"

git add src/lib/...
git commit -m "feat: improve provider filtering"

git add package.json
git commit -m "chore: bump version to 1.2.0"

# All commits are in one PR, one merge
git push origin release/v1.2.0
```

---

## RELEASE BRANCH NAMING CONVENTIONS

**Use**:
- `release/v1.2.3` - standard release
- `release/v2.0.0-rc1` - release candidate
- `release/v1.2.3-beta` - beta release

**Don't use**:
- `release-1.2.3` - missing slash
- `release/latest` - vague
- `release/next` - vague
- `release/main` - conflicts with branches
- `release/2026-02-05` - use version not date

---

## AUTOMATED CHECKS (CI/CD Pipeline)

After pushing release branch, GitHub runs:

1. **TypeScript Check**: `npx tsc --noEmit`
2. **Linting**: `npm run lint`
3. **Unit Tests**: `npm test`
4. **E2E Tests**: `npm run test:e2e`
5. **Build**: `npm run build`

**All must pass** (green checkmarks) before merge is allowed.

---

## SIGN-OFF

After successful release:

```bash
# Confirm release is live
git describe --tags
# Output: v1.2.3

# Monitor application
# - Check logs for errors
# - Verify analytics data flowing
# - Confirm all routes accessible

# Clean up local branches
git branch -a | grep release
# Should show nothing

# Ready for next release
git checkout main
git pull origin main
```

---

## SEE ALSO

- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) - Detailed checklist with all gates
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Production deployment steps
- [CHANGELOG.md](CHANGELOG.md) - Release history
- `.github/workflows/` - CI/CD pipeline configuration
