# RELEASE & QUALITY ASSURANCE SYSTEM

**Version**: 1.0  
**Created**: February 5, 2026  
**Purpose**: Complete release management, quality gates, and validation system

---

## SYSTEM OVERVIEW

This system provides:
- ✅ Structured release process with git branches
- ✅ 5 mandatory quality gates (no uncommitted changes, TypeScript, tests, deep validation, build)
- ✅ Semantic versioning (MAJOR.MINOR.PATCH)
- ✅ Comprehensive test commands (smoke, deep)
- ✅ Automated validation hooks
- ✅ Detailed documentation at all levels

**Core principle**: No production release without passing all gates.

---

## QUICK START (2 minutes)

1. **Starting release**: `git checkout -b release/v1.2.3`
2. **Update version**: Edit `package.json` version field
3. **Run gates**: `git status && npx tsc --noEmit && npm run test:smoke && npm run test:deep && npm run build`
4. **Push**: `git push origin release/v1.2.3`
5. **Create PR** on GitHub titled "Release: v1.2.3"
6. **Merge** after CI/CD passes
7. **Tag**: `git tag -a v1.2.3 -m "Release v1.2.3" && git push origin v1.2.3`

See [RELEASE_QUICK_REFERENCE.md](RELEASE_QUICK_REFERENCE.md) for one-page reference.

---

## DOCUMENTS (WHAT TO READ & WHEN)

### 1. **RELEASE_QUICK_REFERENCE.md** ⭐ START HERE
**When**: Need quick checklist or one-liner commands  
**Duration**: 2 minutes  
**Contains**:
- TL;DR 10-step release
- Gate commands (must pass)
- Version numbering rules
- Common issues & solutions
- One-liners for quick tasks

### 2. **RELEASE_CHECKLIST.md** 📋 COMPREHENSIVE
**When**: First time releasing or want full details  
**Duration**: 5-10 minutes  
**Contains**:
- Detailed 12-section checklist
- Pre-release validation items
- Versioning strategy table
- Smoke test expectations
- Deep test expectations
- Deployment gates
- Rollback procedure

### 3. **RELEASE_BRANCH.md** 🔄 STEP-BY-STEP
**When**: Doing a release, need detailed instructions  
**Duration**: 15-20 minutes  
**Contains**:
- Steps 1-10 with full commands
- Branch creation & cleanup
- Version update process
- All 5 gate explanations
- Pull request creation
- Merge & tag process
- Troubleshooting scenarios

### 4. **.github/RELEASE_GATES.md** 🚪 TECHNICAL
**When**: Understanding gates, automation, or CI/CD  
**Duration**: 10 minutes  
**Contains**:
- Gate 1: No uncommitted changes (git status)
- Gate 2: TypeScript compilation (tsc --noEmit)
- Gate 3: All tests pass (npm test:smoke)
- Gate 4: Deep validation (npm test:deep)
- Gate 5: Production build (npm build)
- Automation scripts
- CI/CD workflow examples
- Blocking vs non-blocking gates

### 5. **DEEP_TEST_REPORT.md** 📊 VALIDATION
**When**: Deep test failed or need validation details  
**Duration**: varies  
**Contains**:
- 6-phase test results (Type safety, runtime, data, telemetry, routing, PWA)
- Bugs found & fixed (TypeScript Promise<never> fix documented)
- Edge case testing results
- Data integrity verification
- Risk assessment table
- Post-launch monitoring recommendations

---

## RELEASE GATES (5 GATES - ALL MUST PASS)

### Gate 1: No Uncommitted Changes ✓
```bash
git status
# Must show: "nothing to commit, working tree clean"
```
**Purpose**: Ensure all code tracked & reviewable  
**Why**: Prevents hidden changes from sneaking into production

### Gate 2: TypeScript Compilation ✓
```bash
npx tsc --noEmit
# Must show: [no output] (zero errors)
```
**Purpose**: Ensure type safety before production  
**Why**: Catches type mismatches that could cause runtime errors

### Gate 3: All Tests Pass ✓
```bash
npm run test:smoke
# Must show: "✓ All tests passed"
```
**Purpose**: Verify functionality works  
**Why**: Catches bugs in business logic

### Gate 4: Deep Validation ✓
```bash
npm run test:deep
# Must show: "All phases passed" + DEEP_TEST_REPORT.md with no HIGH risks
```
**Purpose**: Catch edge cases & data integrity issues  
**Why**: Ensures no hidden bugs or security issues

### Gate 5: Production Build ✓
```bash
npm run build
# Must show: "✓ built in XXs" + .next/ artifacts exist
```
**Purpose**: Ensure bundle is valid for production  
**Why**: Catches bundling issues before deployment

---

## TEST COMMANDS

### npm run test:smoke
Runs backend unit tests + E2E corridor tests (1-2 minutes)
```bash
npm run test:smoke
```
**Tests**:
- 8 backend tests (providers, quotes, timeouts, live API)
- 7 E2E tests (all corridor pages render)

### npm run test:deep
Runs comprehensive 6-phase validation (5-10 minutes)
```bash
npm run test:deep
```
**Phases**:
1. Type & Build Safety (tsc --noEmit)
2. Runtime & Edge Cases (NaN, empty, large amounts)
3. Data Integrity (ranking, math, capabilities)
4. Telemetry & Analytics (non-blocking, PII safety)
5. Routing & SEO (all routes, duplicates)
6. PWA & Installability (offline, manifest, install)

**Output**: DEEP_TEST_REPORT.md with detailed findings

---

## VERSION NUMBERING (Semantic Versioning)

**Format**: `MAJOR.MINOR.PATCH`

### MAJOR (X.0.0) - Breaking Changes
When: Algorithm rewrite, API redesign, architecture shift
```
1.0.0 → 2.0.0
```
Examples:
- Change quote ranking formula
- Rewrite provider data schema
- Major refactor of telemetry system

### MINOR (1.Y.0) - New Features
When: New corridors, new methods, new integrations
```
1.0.0 → 1.1.0
```
Examples:
- Add GBP-INR corridor
- Add crypto wallet payment method
- Add new provider (4th provider)

### PATCH (1.1.Z) - Bug Fixes & Improvements
When: Bug fixes, performance, documentation
```
1.1.0 → 1.1.1
```
Examples:
- Fix TypeScript type error
- Fix incorrect fee calculation
- Improve offline PWA support

**Current Version**:
```bash
grep '"version"' package.json
# "version": "0.1.0"  ← Start here
```

---

## RELEASE BRANCH PROCESS

### Branch Naming
```
release/vX.Y.Z

Examples:
- release/v1.0.0
- release/v1.1.0
- release/v1.1.1
```

### Process Overview
```
main (clean)
    ↓
create: release/v1.2.3
    ↓
update: package.json version
    ↓
verify: all 5 gates pass
    ↓
push: release branch to origin
    ↓
PR: create on GitHub
    ↓
CI/CD: GitHub actions validate
    ↓
merge: PR to main (creates merge commit)
    ↓
tag: create v1.2.3 tag
    ↓
push: tag to origin
    ↓
cleanup: delete release/v1.2.3 branch
    ↓
main (updated, tagged, clean)
```

### Timeline
- **Typical release**: 10-30 minutes (5 gates + PR review)
- **Gate execution**: ~8 minutes
  - TypeScript: ~1 min
  - Unit tests: ~2 min
  - E2E tests: ~1 min
  - Deep test: ~3 min
  - Build: ~1 min
- **PR review**: 5-20 minutes (team dependent)
- **Post-merge**: ~2 minutes (tagging, cleanup)

---

## WHAT CANNOT CHANGE (PROTECTED)

✅ **Safe to change** (encouraged):
- Fix bugs reported by gates
- Add tests to catch edge cases
- Update documentation
- Improve performance
- Refactor code (if tests still pass)

❌ **Cannot change** (violates rules):
- Business logic (quote ranking, fee calculations, affiliate redirects)
- UI/UX design (layouts, colors, components)
- Provider capabilities or data
- Telemetry behavior (what events fire, when)
- Rating signals (speed, flexibility, popularity)

**Gate 4 (Deep Validation)** explicitly checks for these - release fails if any detected.

---

## SUCCESS METRICS

### Release Readiness
- ✅ All 5 gates pass
- ✅ PR approved by peer
- ✅ CI/CD pipeline green
- ✅ Deep test validates with no HIGH risks
- ✅ DEEP_TEST_REPORT.md reviewed

### Post-Release (24 hours)
- ✅ No critical errors in logs
- ✅ Analytics data flowing
- ✅ All routes accessible
- ✅ No spike in error rate
- ✅ Performance metrics stable

---

## COMMON SCENARIOS

### Scenario 1: Normal Release (new feature)
```bash
git checkout -b release/v1.1.0     # New MINOR version
# Add feature code...
npm run test:smoke                  # Tests pass
npm run test:deep                   # Deep validation passes
git push origin release/v1.1.0
# Create PR, merge, tag
git tag -a v1.1.0 -m "Release v1.1.0: Add GBP-INR corridor"
```

### Scenario 2: Hotfix Release (critical bug)
```bash
git checkout v1.1.0                 # Start from last good version
git checkout -b hotfix/v1.1.1       # New PATCH version
# Make minimal fix...
npm run test:smoke                  # Tests pass
npm run test:deep                   # Deep validation passes
git push origin hotfix/v1.1.1
# Create PR, merge, tag
git tag -a v1.1.1 -m "Hotfix v1.1.1: Fix critical bug"
```

### Scenario 3: Release Blocked (gate failed)
```bash
git checkout -b release/v1.2.0
# Make changes...
npm run test:smoke                  # ✗ TEST FAILED

# Fix the issue
nano src/path/to/bug.ts
npm run test:smoke                  # ✓ NOW PASSES

# Continue release
git add .
git commit -m "fix: test failure from feature X"
```

### Scenario 4: Release Rollback (critical issue in production)
```bash
git checkout v1.2.0                 # Go back to bad version
git revert -m 1 <merge-commit>      # Create revert commit
git push origin main
git tag -a v1.2.1 -m "Rollback of v1.2.0"
git push origin v1.2.1
```

---

## TEAM RESPONSIBILITIES

### Release Manager
- [ ] Creates release branch
- [ ] Runs all gates locally
- [ ] Pushes branch & creates PR
- [ ] Monitors CI/CD checks
- [ ] Merges PR & creates tag

### QA Lead (or Peer Review)
- [ ] Reviews DEEP_TEST_REPORT.md
- [ ] Approves PR
- [ ] Signs off on release

### On-Call Engineer (Post-Release)
- [ ] Monitors logs for 24 hours
- [ ] Verifies analytics data
- [ ] Responds to issues
- [ ] Communicates status to team

---

## DOCUMENTATION INDEX

| File | Purpose | Audience |
|------|---------|----------|
| RELEASE_QUICK_REFERENCE.md | Fast checklist, one-liners | Everyone |
| RELEASE_CHECKLIST.md | Full checklist details | Release managers |
| RELEASE_BRANCH.md | Step-by-step process | Release managers, first-timers |
| .github/RELEASE_GATES.md | Gate technical details | DevOps, automation |
| DEEP_TEST_REPORT.md | Validation results | QA, release lead |
| DEPLOYMENT_CHECKLIST.md | Production deployment | DevOps, SRE |
| DEPLOYMENT.md | Infrastructure setup | DevOps, SRE |

---

## GETTING HELP

**Q: Where do I start?**  
A: Read [RELEASE_QUICK_REFERENCE.md](RELEASE_QUICK_REFERENCE.md) (2 min)

**Q: I'm releasing for the first time?**  
A: Read [RELEASE_BRANCH.md](RELEASE_BRANCH.md) (20 min)

**Q: A gate failed, what do I do?**  
A: See [.github/RELEASE_GATES.md](.github/RELEASE_GATES.md) section "TROUBLESHOOTING GATES"

**Q: What should the version be?**  
A: See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) section "VERSIONING STRATEGY"

**Q: Deep test failed, what now?**  
A: Read [DEEP_TEST_REPORT.md](DEEP_TEST_REPORT.md) and review findings

**Q: How do I rollback?**  
A: See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) section "ROLLBACK PROCEDURE"

---

## KEY PRINCIPLES

1. **No hidden code**: All changes must be committed and tracked (Gate 1)
2. **Type safety first**: TypeScript must compile with zero errors (Gate 2)
3. **Tests don't lie**: All tests must pass, no skipped tests (Gate 3)
4. **Verify deeply**: Edge cases and data integrity validated (Gate 4)
5. **Production ready**: Build must succeed with production assets (Gate 5)
6. **No breaking changes**: Business logic, UI, rates never change without MAJOR bump
7. **Semantic versioning**: Clear version numbers communicate change type
8. **Rollback-ready**: Every release tagged and documented for fast rollback

---

## RELEASE HISTORY

Check current releases:
```bash
git tag -l -n --sort=-version:refname | head -20
```

Compare releases:
```bash
git log v1.0.0..v1.1.0 --oneline
```

---

## NEXT STEPS

1. **Read**: [RELEASE_QUICK_REFERENCE.md](RELEASE_QUICK_REFERENCE.md)
2. **Understand**: The 5 gates
3. **Try**: A test release (or practice locally)
4. **Ask questions**: Use "Getting Help" section above
5. **Release**: Follow [RELEASE_BRANCH.md](RELEASE_BRANCH.md)

---

**Last Updated**: February 5, 2026  
**System Status**: ✅ Active & Ready  
**Latest Release**: 0.1.0 (initial)  
**Next Release Target**: 1.0.0 (planned)
