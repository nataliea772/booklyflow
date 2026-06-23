# BooklyFlow — Smart Appointment Automation Platform

BooklyFlow is a Hebrew-first appointment scheduling platform for small businesses. It combines a polished public booking experience, a full admin dashboard, customer reviews, and WhatsApp communication — with Supabase persistence or a localStorage demo mode for development and testing.

**Live demo:** [https://booklyflow.vercel.app/](https://booklyflow.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-unit%20tests-6E9F18?style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright)

---

## Project Overview

BooklyFlow helps clinics, beauty studios, trainers, and private teachers:

- Accept online bookings with real-time availability
- Manage services, business settings, and blocked times
- Confirm, edit, complete, or cancel appointments from admin
- Collect customer reviews after completed visits
- Send WhatsApp messages automatically (Twilio) or manually via `wa.me` links

The UI uses a black-and-white polka-dot boutique theme with full Hebrew RTL support.

---

## Key Features

| Area | Capabilities |
|---|---|
| **Public booking** | Service selection, date/time slots, double-booking prevention, featured services on homepage |
| **Admin dashboard** | Today/week stats, expected revenue, popular service, average rating, cancellation rate |
| **Appointments** | Search, filters, details modal, status actions, WhatsApp templates, delete completed/cancelled |
| **Services** | CRUD, images, search/filter/sort, activate/deactivate |
| **Business settings** | Tabbed settings: details, hours, contact links, branding, booking window |
| **Reviews** | Public display, admin moderation, post-visit review links |
| **WhatsApp** | Server-side Twilio when configured; manual `wa.me` fallback always available |
| **Demo mode** | Full app without Supabase via `localStorage` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Auth | Supabase Auth (admin routes) |
| Messaging | Twilio WhatsApp API (optional) |
| Unit tests | [Vitest](https://vitest.dev) |
| E2E tests | [Playwright](https://playwright.dev) |
| CI | GitHub Actions |

---

## Architecture

```
booklyflow/
├── app/
│   ├── page.tsx                 # Homepage (hero, featured services, reviews)
│   ├── book/                    # Public booking flow
│   ├── review/[appointmentId]/  # Customer review form
│   ├── thank-you/               # Post-booking confirmation
│   ├── login/                   # Admin login
│   ├── admin/                   # Protected admin area
│   └── api/
│       ├── notifications/whatsapp/
│       └── reviews/submit/
├── components/                  # UI (Modal, StatCard, FeaturedServices, …)
├── hooks/                       # useAppointments, useServices, useReviews, …
├── lib/
│   ├── availability.ts          # Scheduling engine
│   ├── dashboard-stats.ts       # Dashboard insight helpers
│   ├── whatsapp-manual-templates.ts
│   ├── service-filters.ts
│   └── supabase/                # Client, migrations, CRUD
└── tests/                       # Vitest + Playwright E2E
```

### Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage with hero, featured services, reviews |
| `/book` | Public | Booking flow |
| `/review/[id]` | Public | Customer review submission |
| `/thank-you` | Public | Booking confirmation |
| `/login` | Public | Admin sign-in |
| `/admin` | Protected | Dashboard with business insights |
| `/admin/appointments` | Protected | Appointment management + details modal |
| `/admin/services` | Protected | Service catalog with search/filter |
| `/admin/business` | Protected | Tabbed business settings |
| `/admin/reviews` | Protected | Review moderation |
| `/admin/blocked-times` | Protected | Vacations and blocked slots |

---

## Database Tables

| Table | Purpose |
|---|---|
| `services` | Service catalog (name, price, duration, image, active flag) |
| `appointments` | Bookings with status, notes, admin notes |
| `business_settings` | Branding, hours, buffer, booking window, contact links |
| `blocked_times` | Full-day or time-range unavailability |
| `customer_reviews` | Ratings and comments linked to appointments |
| `appointment_notifications` | WhatsApp/SMS event tracking |

Migrations live in `lib/supabase/migrations/` (001–015). Run them in order in the Supabase SQL Editor when setting up or upgrading.

---

## Auth and Security

- **Admin routes** (`/admin/*`) require Supabase Auth when env vars are configured
- **Public routes** (`/`, `/book`, `/review/*`) remain open for customers
- **RLS policies** restrict writes to authenticated admins; public read limited to active services and visible reviews
- **Secrets** (`WHATSAPP_*`, service role keys) are server-only — never exposed to the browser
- **Demo mode** skips auth and uses `localStorage` for local development and E2E tests

---

## WhatsApp Communication Flow

1. Admin confirms, cancels, reschedules, or completes an appointment
2. Client calls `POST /api/notifications/whatsapp` with the appointment ID and event type
3. Server attempts Twilio WhatsApp send if credentials are configured
4. On success: admin sees a success notice
5. On failure or missing credentials: admin sees a warning with a **manual `wa.me` link** pre-filled with the Hebrew message
6. **Manual templates** (confirmation, reminder, review request, general) are available from the appointment details modal without requiring Twilio

Phone numbers are normalized to international format for `wa.me` links via `lib/whatsapp-manual-links.ts`.

---

## Testing

```bash
npm test           # Vitest unit tests
npm run build      # Production build + TypeScript
npm run test:e2e   # Playwright E2E (demo mode on port 3002)
```

**Unit test coverage includes:** availability engine, dashboard stats, service filters, WhatsApp templates, review validation, appointment filters, storage, and more.

**E2E tests:** full booking flow and double-booking prevention. E2E runs in demo mode by default (`NEXT_PUBLIC_BOOKLYFLOW_DEMO_MODE=true`) so no live database is required.

Optional Supabase E2E auth:

```env
E2E_USE_SUPABASE_AUTH=true
E2E_ADMIN_EMAIL=your-admin@example.com
E2E_ADMIN_PASSWORD=your-admin-password
```

---

## CI/CD

GitHub Actions runs on push/PR:

- Unit tests (`npm test`)
- Production build (`npm run build`)
- E2E tests (`npm run test:e2e`)

---

## Deployment

Deploy to [Vercel](https://vercel.com) or any Node.js host:

1. Connect the repository
2. Set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `WHATSAPP_*`)
3. Run Supabase migrations
4. Create an admin user in Supabase Auth
5. Deploy

**Production URL:** [https://booklyflow.vercel.app/](https://booklyflow.vercel.app/)

---

## Screenshots

Product screenshots will be added to `docs/screenshots/`:

| File | Description |
|---|---|
| `docs/screenshots/home.png` | Public homepage |
| `docs/screenshots/booking.png` | Booking flow |
| `docs/screenshots/admin-dashboard.png` | Admin dashboard |
| `docs/screenshots/appointments.png` | Appointments management |
| `docs/screenshots/business-settings.png` | Business settings |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- (Optional) Supabase project

### Installation

```bash
git clone <your-repo-url>
cd booklyflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — server-side WhatsApp (Twilio)
WHATSAPP_PROVIDER=twilio
WHATSAPP_ACCOUNT_SID=...
WHATSAPP_AUTH_TOKEN=...
WHATSAPP_FROM_NUMBER=+14155238886
```

See `lib/supabase/migrations/` for database setup. Full migration notes remain in earlier project docs under each migration file.

### Quick tour

1. Visit **`/book`** — book an appointment
2. Visit **`/admin`** — view dashboard stats
3. Visit **`/admin/appointments`** — confirm the booking, open **פרטים** for WhatsApp actions
4. Visit **`/admin/business`** — configure tabs for hours, contact, branding

---

## License

Private portfolio project. All rights reserved.
