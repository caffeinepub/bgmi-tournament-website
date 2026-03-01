# Specification

## Summary
**Goal:** Secure the admin panel with a two-step authentication flow (hardcoded credentials + Internet Identity), clean up the homepage by removing admin-facing shortcuts, and hide the admin link from the public header.

**Planned changes:**
- Remove Quick Access cards (User Panel / Admin Panel) from the homepage so only the hero section, tournaments, and public content remain
- Remove the admin shield/link from the site Header so the admin panel is only reachable by typing /admin directly
- Add backend Motoko stable storage functions: `registerAdminPrincipal`, `getAdminPrincipal`, and `isAdminPrincipal` — enforcing that only one Internet Identity principal can ever be registered as admin
- Update AdminAuthContext to implement a two-step flow: Step 1 validates hardcoded credentials (Username: `Empire Esports`, Password: `Shivam803119&`), Step 2 triggers Internet Identity login and registers or verifies the admin principal against the backend; expose `credentialsVerified` and `isAdminAuthenticated` flags persisted in localStorage
- Update AdminLoginPage to render the two-step UI: a username/password form first, then an "Login with Internet Identity" button; show appropriate error messages and a loading state; redirect to /admin dashboard on full success

**User-visible outcome:** The homepage and header are clean with no admin shortcuts. Admins reach the panel only via /admin, where they must first enter the secret username and password, then authenticate with Internet Identity. The first Internet Identity principal to complete this flow is permanently stored as the sole admin; all subsequent logins must use that same principal across any device.
