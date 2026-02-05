# RELEASE QUICK REFERENCE

**Purpose**: Fast checklist for releases (2-3 minutes to scan)

---

## TL;DR - Release in 10 Steps

```bash
# 1. Start from clean main
git checkout main
git pull origin main
git status  # Must show: "nothing to commit"

# 2. Create release branch
git checkout -b release/v1.2.3

# 3. Bump version
nano package.json
# Change "version": "0.1.0" → "version": "1.2.3"

# 4. Run all gates (must all pass)
git status                          # Clean state
npx tsc --noEmit                    # No TypeScript errors
npm run test:smoke                  # All tests pass
npm run test:deep                   # Deep validation
npm run build                       # Build succeeds

# 5. Commit & push
git add package.json
git commit -m "chore: bump version to 1.2.3"
git push origin release/v1.2.3

# 6. Create PR on GitHub (title: "Release: v1.2.3")

# 7. Wait for CI/CD checks to pass

# 8. Merge PR (creates merge commit)

# 9. Create git tag
git checkout main
git pull origin main
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3

# 10. Clean up
git push origin --delete release/v1.2.3
git branch -d release/v1.2.3
```

---

## GATE COMMANDS (MUST ALL PASS)

```bash
# 1. No uncommitted changes
git status
# MUST show: "On branch release/vX.Y.Z" and "nothing to commit"

# 2. TypeScript clean
npx tsc --noEmit
# MUST show: [no output] (exit code 0)

# 3. All tests pass
npm run test:smoke
# MUST show: "✓ All tests passed"

# 4. Deep validation
npm run test:deep
# MUST show: "All phases passed" + no HIGH risks in DEEP_TEST_REPORT.md

# 5. Production build
npm run build
# MUST show: "✓ built in XXs" and .next/ artifacts exist
```

**If ANY gate fails**: Stop, fix issue, re-run gate

---

## VERSION NUMBERING

| Change | Version | Example |
|--------|---------|---------|
| Breaking changes (API, algorithm) | MAJOR.0.0 | 1.0.0 → 2.0.0 |
| New features (corridors, methods) | X.MINOR.0 | 1.0.0 → 1.1.0 |
| Bug fixes, improvements | X.Y.PATCH | 1.1.0 → 1.1.1 |

**Current version**: Check `package.json`
```bash
grep "version" package.json | head -1
```

---

## BRANCH NAMING

- Create: `git checkout -b release/v1.2.3`
- Push: `git push origin release/v1.2.3`
- Delete: `git push origin --delete release/v1.2.3`

**Format**: `release/vX.Y.Z` (lowercase `v`, semantic version)

---

## CHECKLIST (1 minute scan)

- [ ] On main branch, pulled latest
- [ ] Created `release/vX.Y.Z` branch
- [ ] Updated `package.json` version
- [ ] Gate 1: `git status` clean ✓
- [ ] Gate 2: `npx tsc --noEmit` clean ✓
- [ ] Gate 3: `npm run test:smoke` pass ✓
- [ ] Gate 4: `npm run test:deep` pass ✓
- [ ] Gate 5: `npm run build` succeeds ✓
- [ ] Committed & pushed release branch
- [ ] PR created & CI/CD passes
- [ ] PR merged to main
- [ ] Git tag created & pushed
- [ ] Branch deleted

---

## COMMON ISSUES

| Problem | Solution |
|---------|----------|
| Gate 2 fails (TypeScript) | `npx tsc --noEmit` to see errors, fix types |
| Gate 3 fails (tests) | `npm run test:smoke` to see failures, fix bugs |
| Gate 4 fails (deep test) | `cat DEEP_TEST_REPORT.md` to see HIGH risks |
| Gate 5 fails (build) | `npm run build` for detailed errors |
| Can't push | `git pull origin release/vX.Y.Z` first |
| Branch already exists | `git branch -D release/v1.2.3` then recreate |

---

## DOCUMENTS TO READ

| Document | When | Duration |
|----------|------|----------|
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | First time releasing | 5 min |
| [RELEASE_BRANCH.md](RELEASE_BRANCH.md) | Detailed steps | 10 min |
| [.github/RELEASE_GATES.md](.github/RELEASE_GATES.md) | Understanding gates | 5 min |
| [DEEP_TEST_REPORT.md](DEEP_TEST_REPORT.md) | Deep test failed | varies |

---

## ONE-LINERS

```bash
# Check current version
grep '"version"' package.json

# Run all gates at once
git status && npx tsc --noEmit && npm run test:smoke && npm run test:deep && npm run build

# See recent tags
git tag -l -n --sort=-version:refname | head -10

# See latest release
git describe --tags --abbrev=0

# Compare releases
git log v1.1.0..v1.2.0 --oneline
```

---

## RELEASE CADENCE

**Target**: 1-2 releases per week
- Monday/Wednesday: Feature releases (MINOR)
- Friday: Hotfixes (PATCH) only

**Off-hours**: No production releases 22:00-08:00

---

## TEAM ROLES

| Role | Responsibility |
|------|-----------------|
| **Release Manager** | Create branch, run gates, manage PR |
| **QA Lead** | Review deep test report, approve release |
| **On-Call Engineer** | Monitor production after release, respond to issues |

---

## EMERGENCY RELEASES

**Critical hotfix** (downtime, data corruption, security):
1. Branch from tagged version: `git checkout v1.1.0`
2. Create hotfix: `git checkout -b hotfix/v1.1.1`
3. Make minimal fix
4. Run all gates
5. Create PR to main
6. Merge & tag as `v1.1.1`

**Document**: Why it was necessary in commit message

---

## POST-RELEASE

After merge to main:

```bash
# 1. Monitor logs
tail -f /var/log/app.log

# 2. Check analytics dashboard
open https://app.example.com/analytics

# 3. Monitor error tracking
open https://sentry.example.com/

# 4. Verify all routes accessible
open https://app.example.com/gbp-to-ngn

# 5. Alert team
Post in #releases: "v1.2.3 released successfully"
```

**Success**: No critical errors in logs within 1 hour

---

## RELATED FILES IN REPO

- `RELEASE_CHECKLIST.md` - Full release checklist
- `RELEASE_BRANCH.md` - Detailed step-by-step process
- `.github/RELEASE_GATES.md` - Gate details & automation
- `DEEP_TEST_REPORT.md` - Latest test report
- `DEPLOYMENT_CHECKLIST.md` - Production deployment
- `CHANGELOG.md` - Release history

---

## GIT COMMANDS REFERENCE

```bash
# Create release branch
git checkout -b release/v1.2.3

# Check status
git status

# Stage changes
git add package.json

# Commit
git commit -m "chore: bump version to 1.2.3"

# Push
git push origin release/v1.2.3

# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge (creates merge commit)
git merge --no-ff release/v1.2.3

# Create tag
git tag -a v1.2.3 -m "Release v1.2.3"

# Push tag
git push origin v1.2.3

# Delete remote branch
git push origin --delete release/v1.2.3

# Delete local branch
git branch -d release/v1.2.3

# View tags
git tag -l

# View commits since last tag
git log v1.1.0..v1.2.3 --oneline
```

---

## SUCCESS CRITERIA

Release is ready when:

```
✓ All 5 gates pass
✓ PR approved by team
✓ CI/CD pipeline green
✓ Deep test validated
✓ No business logic changes
✓ No UI/UX changes
✓ Documentation updated
```

→ **SAFE TO MERGE & RELEASE**

---

## SUPPORT

Questions? See full docs:
- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- [RELEASE_BRANCH.md](RELEASE_BRANCH.md)
- [.github/RELEASE_GATES.md](.github/RELEASE_GATES.md)
