# Specification

## Summary
**Goal:** Build a full-stack BGMI tournament website for "Raj Empire Esports" with player registration/login (OTP-based), tournament listings, payment flow, player dashboard, admin panel, terms & conditions page, and a dark battle-royale gaming theme.

**Planned changes:**

### Backend (Motoko single actor)
- Data models: Player, Tournament, TournamentRegistration, TermsAndConditions, SupportTicket, SocialLinks stored in stable storage
- OTP generation/verification per mobile number; one account per mobile enforced
- Tournament slot management: filledSlots increments on approved registration; status auto-sets to Full when filledSlots equals totalSlots
- Admin approval of registrations: Room ID/Password only returned to players with Approved status
- Support ticket CRUD: create, reply, status update (Open/Replied/Closed)
- T&C get/update and SocialLinks get/update functions

### Frontend Pages & Features
- `/register` — Player registration with mobile, display name, BGMI Player ID fields; OTP step with simulated OTP shown on screen; duplicate mobile error; T&C checkbox linking to /terms; redirects to /dashboard on success
- `/login` — Mobile + OTP login; simulated OTP shown on screen; redirects to /dashboard
- `/tournaments` — Active tournament cards showing name, entry fee, prize pool, slots, map, date/time, status; match rules shown when present; disabled "Full" button when slots exhausted; login prompt for unauthenticated users
- Payment modal/page — UPI ID and QR code (fallback to placeholder); payment screenshot upload; T&C checkbox; saves registration as Pending
- `/dashboard` — Player info, tournament registrations with status badges, Room ID/Password visible only for Approved registrations; support ticket creation form and ticket list with detail view
- `/terms` — Fetches and displays T&C content from backend
- `/admin` — Hardcoded login (username: "Empire Esports", password: "Shivam803119&"); six sections: Tournament Management (add/edit/delete with all fields), Registrations (approve/reject with screenshots), Player List, T&C editor, Support Tickets (reply + status update), Social Links (YouTube/Instagram/Telegram URLs)

### Theming & Branding
- Near-black background, orange/gold accents, sharp angular UI, military/tactical typography throughout
- Tab title, header, and footer branded as "Raj Empire Esports"
- `raj-empire-esports-logo.dim_400x120.png` used as header logo
- Footer displays YouTube, Instagram, Telegram icon links fetched from backend

**User-visible outcome:** Players can register, log in via OTP, browse and register for BGMI tournaments with UPI payment screenshot upload, view registration status and room credentials on their dashboard, and submit support tickets. Admins can manage tournaments, approve/reject registrations, reply to support tickets, and update T&C and social links — all within a dark, high-energy gaming-themed website.
