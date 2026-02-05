# RELEASE CHECKLIST

**Purpose**: Ensure production releases are safe, tested, and properly versioned.

**Release Manager**: [Name]  
**Release Date**: [Date]  
**Version**: [X.Y.Z]  

---

## PRE-RELEASE VALIDATION (Must Pass All)

### 1. Repository State ✓
- [ ] No uncommitted changes
  ```bash
  git status
  # Must show: "On branch main" and "nothing to commit"
  ```
- [ ] On main branch
  ```bash
  git branch | grep "^\*"
  # Must show: "* main"
  ```
- [ ] Latest changes pulled
  ```bash
  git pull origin main
  # Must show: "Already up to date" or list new commits
  ```

### 2. Version Updated ✓
- [ ] `package.json` version bumped (see [Versioning Strategy](#versioning-strategy))
  ```json
  "version": "1.2.3"
  ```
- [ ] Version matches tag format (e.g., `v1.2.3`)
- [ ] Changelog entry added (if applicable)
- [ ] Git tag created
  ```bash
  git tag -a v1.2.3 -m "Release v1.2.3: [Brief description]"
  git push origin v1.2.3
  ```

### 3. TypeScript & Build ✓
- [ ] TypeScript compilation passes
  ```bash
  npx tsc --noEmit
  # Must show: no output (zero errors)
  ```
- [ ] Production build succeeds
  ```bash
  npm run build
  # Must complete without errors
  ```
- [ ] Build artifacts generated
  ```bash
  ls -la .next/
  # Must show: static, server, standalone, etc.
  ```

### 4. Smoke Tests ✓
- [ ] All backend unit tests pass
  ```bash
  npm test
  # Must show: ✓ All tests passed
  ```
- [ ] All E2E tests pass
  ```bash
  npm run test:e2e
  # Must show: ✓ 7/7 tests passed
  ```
- [ ] No test failures or timeouts

### 5. Deep Test Validation ✓
- [ ] Run full deep test suite
  ```bash
  npm run test:deep
  # Must complete without critical errors
  ```
- [ ] Review DEEP_TEST_REPORT.md
  - [ ] All 6 phases passed ✅
  - [ ] No HIGH severity risks
  - [ ] All fixes applied
- [ ] Confirm zero business logic changes
  - [ ] No changes to ranking algorithm
  - [ ] No changes to fee/rate calculations
  - [ ] No changes to provider capabilities
  - [ ] No changes to affiliate redirects
  - [ ] No changes to UI/UX

### 6. Code Quality ✓
- [ ] Linting passes
  ```bash
  npm run lint
  # Must show: 0 errors, 0 warnings (or acceptable warnings only)
  ```
- [ ] No console.log() statements in production code
  ```bash
  grep -r "console\\.log" src/
  # Must show: no matches (or only dev-only statements)
  ```
- [ ] No commented-out code blocks
  ```bash
  grep -r "^[[:space:]]*//[[:space:]]*export\|//[[:space:]]*const\|//[[:space:]]*function" src/
  # Must show: no matches
  ```

### 7. Security & Secrets ✓
- [ ] No hardcoded API keys in code
  ```bash
  grep -r "api_key\|secret\|password" src/ --include="*.ts" --include="*.tsx"
  # Must show: no matches
  ```
- [ ] All secrets in `.env.local` (not committed)
  ```bash
  git status | grep ".env"
  # Must show: no .env files in staged changes
  ```
- [ ] `.gitignore` includes sensitive files
  ```bash
  cat .gitignore | grep -E ".env|secrets|private"
  # Must show: matches
  ```

### 8. Database & Migration ✓
- [ ] Database schema is up-to-date
  ```bash
  npm run db:migrate
  # Must show: "Up to date" or list applied migrations
  ```
- [ ] SQLite telemetry database exists
  ```bash
  ls -la data/telemetry.db
  # Must show: file exists
  ```
- [ ] No pending schema changes
  - [ ] All tables defined in `src/lib/db.ts`
  - [ ] All migrations applied

### 9. PWA & Assets ✓
- [ ] Manifest.json is valid
  ```bash
  cat public/manifest.json | jq .
  # Must show: valid JSON, no errors
  ```
- [ ] Service worker file exists
  ```bash
  ls -la public/sw.js
  # Must show: file exists, > 1KB
  ```
- [ ] Icons exist (or confirmed placeholders)
  ```bash
  ls -la public/icons/
  # Must show: icon files present
  ```
- [ ] Offline shell includes all main routes
  - [ ] `/` (home)
  - [ ] `/gbp-to-ngn` (and other 5 active corridors)

### 10. Environment Variables ✓
- [ ] `.env.production` properly configured (review, don't commit)
  - [ ] Database URL set
  - [ ] API endpoints correct
  - [ ] Analytics tracking enabled
  - [ ] Telemetry enabled
- [ ] No hardcoded localhost URLs
  ```bash
  grep -r "localhost\|127.0.0.1\|:3000" src/ --include="*.ts" --include="*.tsx"
  # Must show: no matches
  ```
- [ ] All required env vars documented
  ```bash
  cat .env.example  # Must exist with template
  ```

### 11. Performance Baseline ✓
- [ ] Lighthouse score >= 80
  ```bash
  npm run lighthouse
  # Must show: Performance, Accessibility, Best Practices >= 80
  ```
- [ ] Core Web Vitals acceptable
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms (or INP < 200ms)
  - [ ] CLS < 0.1
- [ ] Bundle size within limits
  ```bash
  npm run analyze
  # Review: main bundle should be < 500KB gzipped
  ```

### 12. Documentation ✓
- [ ] README.md is current
  - [ ] Setup instructions work
  - [ ] API endpoints documented
  - [ ] Environment variables listed
- [ ] CHANGELOG.md updated (if applicable)
  - [ ] New features listed
  - [ ] Bug fixes listed
  - [ ] Breaking changes noted
- [ ] API documentation current
  - [ ] All routes documented
  - [ ] Request/response formats shown
  - [ ] Error codes explained

---

## RELEASE BRANCH PROCESS

### Branch Creation
```bash
git checkout -b release/v1.2.3
```

### Release Tasks
1. Update version in `package.json`
2. Update `CHANGELOG.md` with release notes
3. Run all checklist items above
4. Create Pull Request to `main` with title: `Release: v1.2.3`

### Pull Request Requirements
- [ ] Title: `Release: v1.2.3`
- [ ] Description: Links to CHANGELOG, lists key changes
- [ ] All checks pass (CI/CD pipeline)
- [ ] Minimum 1 approval (if team > 1)
- [ ] Branch up-to-date with main

### Merge & Deploy
```bash
git checkout main
git pull origin main
git merge --no-ff release/v1.2.3
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin main
git push origin v1.2.3
```

### Post-Release
- [ ] Monitor error logs for 24 hours
- [ ] Verify analytics data flowing
- [ ] Confirm all routes accessible
- [ ] Monitor database performance
- [ ] Delete release branch
  ```bash
  git push origin --delete release/v1.2.3
  git branch -d release/v1.2.3
  ```

---

## VERSIONING STRATEGY

**Format**: `MAJOR.MINOR.PATCH` (semantic versioning)

### MAJOR version (X.0.0)
When: Breaking changes to public API, major feature overhaul, or architecture shift
Examples:
- Rewrite quote ranking algorithm
- Change provider API schema
- Alter telemetry format

### MINOR version (1.Y.0)
When: New features, new corridors, new transfer methods
Examples:
- Add new corridor (GBP-NGN → GBP-INR)
- Add new transfer method (crypto wallet)
- New analytics dashboard
- New provider integration

### PATCH version (1.1.Z)
When: Bug fixes, performance improvements, typo fixes
Examples:
- Fix TypeScript type error
- Fix incorrect fee calculation
- Improve page load time
- Fix PWA offline handling

### Version History
| Version | Date | Type | Changes |
|---------|------|------|---------|
| 1.0.0 | 2026-02-01 | Initial | Launch with 6 corridors, 3 providers, analytics |
| 1.1.0 | 2026-02-15 | MINOR | Added GBP-INR, GBP-KES corridors |
| 1.1.1 | 2026-02-20 | PATCH | Fixed TypeScript type issues, improved offline mode |

---

## SMOKE TEST COMMAND

Run before release to verify core functionality:

```bash
npm run test:smoke
```

**What it tests**:
- ✓ All API endpoints respond
- ✓ All corridor pages render
- ✓ Provider data loads
- ✓ Quote ranking works
- ✓ Telemetry records events
- ✓ Redirects to providers work
- ✓ PWA manifest valid

**Expected output**:
```
✓ smoke.page-structure.test.ts (6 tests)
✓ smoke.backend.test.ts (8 tests)
✓ smoke.redirects.test.ts (4 tests)
✓ smoke.e2e.test.ts (7 tests)

✓ 25 tests passed
```

---

## DEEP TEST COMMAND

Run before major releases to validate stability:

```bash
npm run test:deep
```

**What it tests**:
- ✓ PHASE 1: TypeScript strict compilation
- ✓ PHASE 2: Runtime & edge cases (NaN, empty, very large amounts)
- ✓ PHASE 3: Data integrity (ranking, calculations, capabilities)
- ✓ PHASE 4: Telemetry & analytics (non-blocking, PII safety)
- ✓ PHASE 5: Routing & SEO (all routes, no duplicates)
- ✓ PHASE 6: PWA & installability (offline, manifest, install flows)

**Expected output**:
```
PHASE 1: Type & Build Safety .......... ✓ PASS
PHASE 2: Runtime & Edge Cases ........ ✓ PASS
PHASE 3: Data Integrity .............. ✓ PASS
PHASE 4: Telemetry & Analytics ....... ✓ PASS
PHASE 5: Routing & SEO ............... ✓ PASS
PHASE 6: PWA & Installability ........ ✓ PASS

DEEP TEST REPORT GENERATED: DEEP_TEST_REPORT.md
```

**Duration**: ~5-10 minutes

**Review report**: 
```bash
cat DEEP_TEST_REPORT.md
```

---

## DEPLOYMENT GATES

### Gate 1: No Uncommitted Changes
```bash
git status
# FAIL if: "nothing to commit" is NOT shown
# PASS if: "nothing to commit, working tree clean"
```

**Why**: Ensures all code changes are tracked and reviewable.

### Gate 2: TypeScript Compilation
```bash
npx tsc --noEmit
# FAIL if: any error output
# PASS if: no output (zero errors)
```

**Why**: Ensures type safety before production.

### Gate 3: All Tests Pass
```bash
npm test && npm run test:e2e
# FAIL if: any test fails
# PASS if: all tests pass
```

**Why**: Ensures functionality is working as expected.

### Gate 4: Deep Test Validation
```bash
npm run test:deep
# FAIL if: DEEP_TEST_REPORT.md shows any HIGH risks or failures
# PASS if: all 6 phases pass
```

**Why**: Ensures no hidden bugs or edge cases.

### Gate 5: Build Success
```bash
npm run build
# FAIL if: any build errors
# PASS if: build succeeds, .next/ artifacts exist
```

**Why**: Ensures production bundle is valid.

---

## RELEASE SIGN-OFF

After all checks pass, sign off:

- [ ] **Release Manager**: _________________ Date: _________
- [ ] **QA Lead** (if applicable): _________________ Date: _________
- [ ] **Product Owner** (if applicable): _________________ Date: _________

---

## ROLLBACK PROCEDURE

If critical issues found in production:

```bash
# 1. Identify last known-good version
git tag | tail -5

# 2. Checkout previous version
git checkout v1.1.0

# 3. Create hotfix branch
git checkout -b hotfix/urgent-fix

# 4. Fix issue (minimal change only)
# ... make fix ...

# 5. Test thoroughly
npm run test:smoke
npm run test:deep

# 6. Push hotfix and create PR
git push origin hotfix/urgent-fix

# 7. After approval, merge to main
git checkout main
git merge hotfix/urgent-fix
git tag -a v1.1.1 -m "Hotfix: critical issue"
git push origin main v1.1.1

# 8. Delete hotfix branch
git push origin --delete hotfix/urgent-fix
```

---

## RELEASE NOTES TEMPLATE

```markdown
# Release v1.2.3 - [Date]

## What's New
- New corridor: GBP-INR
- Improved speed signals for cash transfers
- Better offline support

## Bug Fixes
- Fixed TypeScript type errors in live quote fetching
- Corrected fee calculation for card transfers
- Improved mobile layout on smaller screens

## Breaking Changes
None

## Security Updates
None

## Performance
- Page load time reduced by 15%
- Service worker caching improved

## Database Migrations
None required

## Known Issues
None

## Upgrade Instructions
1. Pull latest main branch
2. Run: npm install
3. Run: npm run build
4. Restart application
```

---

## SUPPORT & TROUBLESHOOTING

**Release process unclear?**
- Refer to RELEASE_BRANCH.md for detailed instructions

**Test failed?**
- Run `npm run test:smoke` to identify issue
- Check DEEP_TEST_REPORT.md for known issues
- Consult error logs in terminal output

**Build failed?**
- Run `npx tsc --noEmit` to check TypeScript errors
- Run `npm run build` to see detailed build errors
- Check `.env` variables are properly set

**Deployment failed?**
- Verify all gates passed
- Check server logs for errors
- Consider rollback (see Rollback Procedure above)

**Questions?**
- Check README.md for setup/architecture
- Review API documentation
- Check DEPLOYMENT_CHECKLIST.md or DEPLOYMENT.md for production setup
