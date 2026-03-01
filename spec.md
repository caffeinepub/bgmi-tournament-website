# Specification

## Summary
**Goal:** Replace the single "Verify with Internet Identity" button on the Register Step 2 (Authenticate) screen and the Login page with four distinct authentication option buttons styled after the id.ai "Choose method" UI.

**Planned changes:**
- On Register Step 2 (Authenticate screen), remove the single "Verify with Internet Identity" button and replace it with four buttons: Google (multicolor G icon), Apple (Apple logo), Microsoft (colored squares logo), and "Continue with Passkey" (person/passkey icon)
- Google, Apple, and Microsoft buttons are displayed in a row (3 columns), with "Continue with Passkey" as a full-width button below
- On the Login page, replace the existing single Internet Identity button with the same four-button layout (Google, Apple, Microsoft in a row + Continue with Passkey full-width below)
- Each of the four buttons triggers the same existing Internet Identity login flow — no backend changes
- Error state and retry behavior remain unchanged

**User-visible outcome:** Users on both the Register (Step 2) and Login pages now see four visually distinct authentication options (Google, Apple, Microsoft, Continue with Passkey) matching the id.ai "Choose method" style, instead of a single generic Internet Identity button.
