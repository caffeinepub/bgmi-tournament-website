# Specification

## Summary
**Goal:** Build the complete Raj Empire Esports Arena platform — a full-stack BGMI tournament management application with public home page, player dashboard, admin panel, and all supporting pages, styled with a red-orange fire gradient theme.

**Planned changes:**

### Backend
- Tournament model with fields: id, type (daily/mega), title, entryFee, prizePool, squadSize (Solo/Duo/Squad), upiId, qrCodeImage (blob), posterImage (blob, mega only), status (upcoming/ongoing/completed), slots, registeredCount, createdAt
- Player/User model with fields: id, displayName, mobileNumber, bgmiPlayerId, registeredAt
- Registration model with fields: id, tournamentId, playerId, paymentScreenshot (blob), status (pending/approved/rejected), registeredAt
- Support ticket model
- Social links model
- Terms & Conditions model
- CRUD functions for all models with admin-only write access

### Frontend — Theme
- Red-orange fire gradient theme: deep red (#C0100A) to bright orange (#FF6A00) applied across all pages
- Orbitron/Rajdhani fonts for headings
- Consistent buttons, cards, and badges following the red-orange brand palette

### Frontend — Public Home Page
- Hero section with "India's Premier BGMI Tournament Platform" badge, "Raj Empire Esports Arena" heading, tagline, "View Tournaments" and "Join Now — Free" CTA buttons
- Feature highlights section
- Header with navigation and auth-aware actions
- Footer with social links (YouTube, Instagram, Telegram) fetched from backend

### Frontend — Player Auth
- Multi-step registration collecting displayName, mobileNumber, bgmiPlayerId with OTP verification
- Two-step login with OTP verification
- Session persisted in localStorage via AuthContext
- ProtectedRoute redirecting unauthenticated users to login

### Frontend — Player Dashboard
- Tournaments tab: lists all tournaments with status filtering, shows entry fee, prize pool, squad size, available slots, register button
- My Registrations tab: shows player's registrations with status (pending/approved/rejected)
- Profile tab: shows display name, mobile, BGMI ID

### Frontend — Payment Modal
- Shows tournament-specific UPI ID and QR code image fetched from backend
- Payment screenshot upload
- Terms acceptance checkbox required before submission
- Success confirmation state after submission

### Frontend — Admin Login
- Username/password form with hardcoded credentials
- Show/hide password toggle
- Redirect to admin dashboard on success, error message on failure
- Admin session persisted in localStorage via AdminAuthContext

### Frontend — Admin Dashboard
- Collapsible sidebar with tabbed sections
- Daily Tournaments: create/edit/delete with title, entryFee, prizePool, squadSize, totalSlots, UPI ID, QR code image upload, status — each tournament stores its own independent UPI/QR
- Mega Tournaments: create/edit/delete with poster image upload, entryFee, squadSize, totalSlots, status — no extra text fields
- Registrations: view all registrations, approve/reject, view payment screenshots
- Players: view all registered players
- Terms & Conditions: edit and save T&C text
- Support Tickets: view and respond
- Social Links: set YouTube, Instagram, Telegram URLs

### Frontend — Terms & Conditions Page
- Fetches T&C content from backend
- Numbered sections with colored headings
- Hardcoded fallback content if backend returns empty

**User-visible outcome:** Players can browse BGMI tournaments, register with payment proof, and track their registration status on a fire-themed dashboard. Admins can manage tournaments, registrations, players, social links, and site content through a full admin panel.
