# Specification

## Summary
**Goal:** Fix the multi-step registration flow on the RegisterPage so that Step 1 collects player details and Step 2 presents the Internet Identity authentication button.

**Planned changes:**
- Update RegisterPage Step 1 to show Name, Phone Number, and BGMI Player ID fields
- After Step 1 submission, transition to Step 2 which displays the Internet Identity login/authentication button clearly and functionally
- Add a step indicator showing progress (Step 1 → Step 2 → Success)
- On successful Internet Identity authentication, register the player and redirect to the player dashboard

**User-visible outcome:** Users filling out the registration form will first enter their name, phone number, and BGMI Player ID, then be taken to a clearly visible Step 2 where they can authenticate via Internet Identity to complete registration.
