# Smoke Test Contract

Critical user path that must always work:

1. User opens /gbp-to-ngn
   - Page renders within 2 seconds
   - Comparison table is visible

2. At least one provider row is visible
   - Provider name
   - Receive amount
   - "Send with Provider" button

3. Clicking "Send with Provider":
   - Calls /go/provider/{providerId}
   - Logs click
   - Returns HTTP 302
   - Redirects to provider website

4. If live quote fetch fails:
   - UI falls back to mock data
   - Page still renders
   - No errors shown to user

These behaviours must not regress.
