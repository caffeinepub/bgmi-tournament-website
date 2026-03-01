# Specification

## Summary
**Goal:** Fix the registration flow in `RegisterPage.tsx` so that Step 2 auto-triggers the Internet Identity popup, handles cancelled/failed auth gracefully, and redirects the user to the Home Page after successful registration.

**Planned changes:**
- Add a `useEffect` in `RegisterPage.tsx` that automatically calls the Internet Identity login function when the step transitions to Step 2, removing the need for a manual button click
- Fix the stuck "Connecting..." loading state: reset the connecting state if Internet Identity login is cancelled, fails, or times out, so the user can retry
- After successful registration (Step 3 - Done), automatically redirect the user to `/` (Home Page) using the router's navigate function

**User-visible outcome:** When a user completes Step 1 and moves to Step 2, the Internet Identity popup opens automatically. If authentication fails or is cancelled, the button resets for retry. Once registration is fully complete, the user is automatically sent to the Home Page.
