# Specification

## Summary
**Goal:** Remove OTP verification from the player registration flow and replace it with Internet Identity authentication, fixing the "Unauthorized" error during registration.

**Planned changes:**
- Refactor the RegisterPage stepper from 3 steps (Details → Verify OTP → Done) to 2 steps (Details → Done)
- Remove the OTP input field, "Demo OTP: 1234" banner, and all OTP generation/verification logic from the registration flow
- Step 1 remains: Display Name, Mobile Number, and BGMI Player ID fields with a Continue button
- Step 2 replaced: Show an Internet Identity login button that triggers the Internet Identity authentication popup using the existing `useInternetIdentity` hook
- After successful Internet Identity authentication, call `registerPlayer` on-chain with the authenticated principal
- Update the backend `registerPlayer` authorization check in `main.mo` to accept Internet Identity-authenticated principals and reject only anonymous principal calls

**User-visible outcome:** Players can register by filling in their details and then authenticating via Internet Identity popup — no OTP entry required. Registration completes successfully without the "Unauthorized" error.
