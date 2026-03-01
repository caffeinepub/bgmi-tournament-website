# Specification

## Summary
**Goal:** Fix the broken authentication flow on both the RegisterPage (Step 2) and LoginPage by replacing custom auth buttons with a single "Connect with Internet Identity" button that directly triggers the Internet Identity native popup.

**Planned changes:**
- On RegisterPage Step 2 ("Authenticate" step): remove the custom auth buttons and the stuck "Connecting..." state; clear any stale loading state on mount; remove the persistent "Authentication cancelled or failed. Please try again." error message; replace with a single "Connect with Internet Identity" button that calls `login()` from `useInternetIdentity` hook directly
- On LoginPage: remove the `AuthMethodButtons` component (Google, Apple, Microsoft, Passkey buttons) and the "CHOOSE METHOD" UI; replace with a single "Connect with Internet Identity" button that calls `login()` from `useInternetIdentity` hook directly
- If authentication fails or is cancelled, show an error message but immediately reset the button to a clickable state

**User-visible outcome:** Users can click a single "Connect with Internet Identity" button on both the Login and Register (Step 2) pages that immediately opens the Internet Identity native popup, with no stuck loading states or stale error messages.
