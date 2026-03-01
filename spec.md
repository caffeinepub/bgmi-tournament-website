# Specification

## Summary
**Goal:** Fix the OTP authentication error blocking registration/login, redesign all pages with a dark background and orange/white theme, and add domain name management in the Admin Dashboard.

**Planned changes:**
- Fix backend `generateOTP` function to allow unauthenticated (anonymous) callers, removing the "Unauthorized: Only authenticated users can generate OTPs" error on Register and Login pages
- Redesign all Player Panel pages (Home, Register, Login, Dashboard, Tournaments, Terms) with deep dark backgrounds, vibrant orange accents for buttons/highlights/borders/active states, and white/light gray for text
- Redesign Admin Panel pages (Admin Login, Admin Dashboard) with the same dark background and orange/white theme
- Apply the consistent orange/white/dark theme to all cards, forms, modals, headers, footers, and navigation across both panels
- Add a persistent `domainName` field to backend state defaulting to 'Raj-Empire-Esports', with `getDomainName` (public query) and `setDomainName` (admin-only update) functions
- Add a 'Domain Settings' section in the Admin Dashboard showing the current domain name in an editable input field with a Save button, styled in the orange/white/dark theme

**User-visible outcome:** Players can register and log in without OTP errors; all pages display a cohesive dark background with orange and white styling; admins can view and update the domain name directly from the Admin Dashboard.
