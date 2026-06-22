# BooklyFlow — Smart Appointment Automation Platform

A full-stack appointment scheduling and automation platform for small businesses. BooklyFlow helps clinics, beauty studios, trainers, and private teachers accept online bookings, manage services, and run their schedule from a calm, modern admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-23%20tests-6E9F18?style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-2%20E2E-2EAD33?style=flat-square&logo=playwright)

---

## Key Features

- **Online appointment booking** — Customer-facing booking flow with service, date, and time selection
- **Service management** — Add and organize services with pricing and duration
- **Availability calculation** — Smart slot generation based on business hours and service length
- **Double-booking prevention** — Blocks overlapping pending and confirmed appointments
- **Buffer time** — Configurable minutes between appointments for cleanup and prep
- **Admin dashboard** — Live stats for today’s appointments, pending, confirmed, and revenue
- **Confirm / cancel flow** — Manage appointment status from the admin panel
- **LocalStorage persistence** — Demo mode persists user bookings across sessions
- **Unit tests with Vitest** — 23 tests covering scheduling logic and storage
- **E2E tests with Playwright** — Full browser tests for booking and admin workflows

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| UI | [React](https://react.dev) |
| Unit tests | [Vitest](https://vitest.dev) |
| E2E tests | [Playwright](https://playwright.dev) |
| Demo persistence | `localStorage` |
| Planned | [Supabase](https://supabase.com), GitHub Actions, Vercel |

---

## Architecture Overview

```
booklyflow/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── book/               # Customer booking flow
│   └── admin/              # Dashboard, appointments, services
├── components/             # Reusable UI (Navbar, Card, Button, StatCard, …)
├── hooks/
│   └── useAppointments.ts  # Shared appointment state (hydration-safe)
├── lib/
│   ├── types.ts            # Service, Appointment, BusinessSettings, TimeSlot
│   ├── availability.ts     # Scheduling engine (slots, overlap, buffer)
│   ├── storage.ts          # localStorage CRUD and merge logic
│   └── mock-data.ts        # Seed data for demo mode
└── tests/
    ├── availability.test.ts
    ├── storage.test.ts
    └── e2e/
        └── booking-flow.spec.ts
```

### Routes (`app/`)

| Route | Description |
|---|---|
| `/` | Marketing landing page with hero, features, and CTA |
| `/book` | Customer booking form with live availability |
| `/admin` | Dashboard with dynamic stats |
| `/admin/appointments` | Appointment list with confirm / cancel actions |
| `/admin/services` | Service catalog and add-service form |

### Scheduling engine (`lib/availability.ts`)

Pure TypeScript functions that power slot generation:

- Converts between time strings and minutes
- Detects range overlap (half-open intervals)
- Generates 30-minute slot candidates within business hours
- Excludes slots that overlap pending/confirmed appointments (plus buffer)
- Respects working days and closing time

### Persistence (`lib/storage.ts`)

Handles demo-mode persistence without a backend:

- Stores **user-created** appointments in `localStorage`
- Merges stored data with mock seed appointments (no duplicate IDs)
- Persists status overrides for mock appointments separately
- Safe SSR guards and invalid JSON handling

### Shared state (`hooks/useAppointments.ts`)

React hook used by `/book` and admin pages:

- Initializes with mock data to avoid hydration mismatches
- Loads `localStorage` on client mount
- Exposes `addAppointment`, `updateAppointmentStatus`, and `resetDemoData`

---

## Testing

BooklyFlow has automated coverage at both the logic and browser layers.

| Suite | Count | Scope |
|---|---|---|
| Vitest unit tests | **23** | Availability engine, storage layer |
| Playwright E2E | **2** | Full booking flow, double-booking prevention |
| TypeScript build | ✓ | Strict type-checking via `next build` |

### Commands

```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright — starts dev server automatically)
npm run test:e2e

# Production build + TypeScript check
npm run build
```

Additional scripts:

```bash
npm run test:watch    # Vitest in watch mode
npm run test:e2e:ui   # Playwright interactive UI
npm run lint          # ESLint
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <your-repo-url>
cd booklyflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick tour

1. Visit **`/book`** — select a service, date, and available time slot, then submit a booking
2. Visit **`/admin/appointments`** — find your booking and click **Confirm**
3. Visit **`/admin`** — see updated pending, confirmed, and revenue stats

Use **Reset demo data** on the admin pages to clear `localStorage` and restore seed data.

---

## Business Rules (Demo Mode)

| Setting | Value |
|---|---|
| Business name | BooklyFlow Studio |
| Hours | 09:00 – 18:00 |
| Working days | Sunday – Thursday |
| Slot interval | 30 minutes |
| Buffer after appointments | 15 minutes |

---

## Future Improvements

- [ ] **Supabase** — Replace localStorage with a real PostgreSQL database
- [ ] **Authentication** — Business owner and customer login
- [ ] **Email reminders** — Automated confirmation and reminder emails
- [ ] **Google Calendar** — Two-way calendar sync
- [ ] **CI/CD** — GitHub Actions for test, lint, and build on every PR
- [ ] **Deployment** — Production hosting on Vercel

---

## License

Private portfolio project. All rights reserved.
