# Specification

## Summary
**Goal:** Fix admin authorization errors and achieve full bidirectional data sync between the admin panel and user/player panel for the Raj Empire Esports platform, including adding Room ID, Room Password, and YouTube URL fields to tournaments.

**Planned changes:**
- Fix backend admin authorization so the authenticated admin's Internet Identity principal is always recognized, eliminating "Unauthorized: Only admins can create tournaments" errors for all admin operations
- Fix backend support tickets storage and retrieval so tickets submitted by players are visible in the admin panel's Support Tickets section
- Fix backend player/user registration storage so all registered players, registrations, payment proofs, and withdrawal requests appear in the admin panel
- Add `roomId`, `roomPassword`, and `youtubeUrl` optional fields to the tournament data model in the backend
- Allow admin to set/update Room ID, Room Password, and YouTube URL for any tournament via backend update functions
- Add Room ID, Room Password, and YouTube URL input fields to the admin panel's tournament create/edit form
- Update admin dashboard to use the admin-authenticated actor for all data queries (tournaments, registrations, players, payment proofs, withdrawals, support tickets)
- Update the player dashboard to display Room ID, Room Password, and a clickable YouTube URL for registered tournaments when set by admin
- Add a canister state migration to include new tournament fields without losing existing data

**User-visible outcome:** Admin can create and manage tournaments without authorization errors, all player-submitted support tickets and registrations appear in the admin panel, admin can set Room ID/Password and YouTube stream URLs for tournaments, and players see those details in their dashboard.
