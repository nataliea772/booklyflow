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
- **Supabase persistence** — PostgreSQL-backed appointments and services when configured
- **Admin authentication** — Supabase Auth protects `/admin/*` when configured
- **LocalStorage demo mode** — Falls back to in-browser persistence when Supabase env vars are missing
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
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Authentication | Supabase Auth (admin routes) |
| Unit tests | [Vitest](https://vitest.dev) |
| E2E tests | [Playwright](https://playwright.dev) |
| Demo fallback | `localStorage` |
| CI | GitHub Actions |

---

## Architecture Overview

```
booklyflow/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── book/               # Customer booking flow
│   ├── login/              # Admin login (Supabase Auth)
│   └── admin/              # Dashboard, appointments, services (protected)
├── components/             # Reusable UI (Navbar, Card, Button, StatCard, …)
├── hooks/
│   ├── useAppointments.ts  # Appointments (Supabase or localStorage)
│   ├── useServices.ts      # Services (Supabase or mock fallback)
│   └── useAuth.ts          # Supabase Auth session for admin
├── lib/
│   ├── types.ts            # Service, Appointment, BusinessSettings, TimeSlot
│   ├── availability.ts     # Scheduling engine (slots, overlap, buffer)
│   ├── storage.ts          # localStorage CRUD and merge logic (demo mode)
│   ├── mock-data.ts        # Seed data for demo mode
│   └── supabase/
│       ├── client.ts       # Browser Supabase client + isSupabaseConfigured
│       ├── auth.ts         # signInWithEmail, signOut, getCurrentUser
│       ├── schema.sql      # Tables, RLS policies, and seed data
│       ├── appointments.ts # getAppointments, createAppointment, updateStatus
│       └── services.ts     # getServices
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
| `/book` | Customer booking form with live availability (public) |
| `/login` | Admin sign-in when Supabase is configured |
| `/admin` | Dashboard with dynamic stats (protected) |
| `/admin/appointments` | Appointment list with confirm / cancel actions (protected) |
| `/admin/services` | Service catalog and add-service form (protected) |

### Scheduling engine (`lib/availability.ts`)

Pure TypeScript functions that power slot generation:

- Converts between time strings and minutes
- Detects range overlap (half-open intervals)
- Generates 30-minute slot candidates within business hours
- Excludes slots that overlap pending/confirmed appointments (plus buffer)
- Respects working days and closing time

### Persistence

**Supabase mode** (when env vars are set):

- Appointments and services load from PostgreSQL via `@supabase/supabase-js`
- Bookings and status updates write to the `appointments` table
- **Admin routes require login** via Supabase Auth (`/login`)
- Public `/book` remains open for customer bookings without login

**Demo mode** (when env vars are missing):

- Stores user-created appointments in `localStorage`
- Merges stored data with mock seed appointments
- Persists status overrides for mock appointments separately

The app picks the mode automatically via `isSupabaseConfigured()` in `lib/supabase/client.ts`.

---

## Supabase Setup

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database schema

Open the **SQL Editor** in your Supabase dashboard and run the contents of:

```
lib/supabase/schema.sql
```

This creates `services`, `appointments`, `business_settings`, and `blocked_times` tables, enables RLS with public policies for demo use, and inserts seed services plus business settings.

**If service edit, deactivate, or reactivate fails** (for example with a Supabase error about coercing to a single JSON object), run the services RLS migration in the Supabase SQL Editor:

```
lib/supabase/migrations/002_services_admin_policies.sql
```

This grants authenticated admins full read/update access (including inactive services) while keeping public booking limited to active services only. Also run `001_business_branding.sql` if you use business logos, cover images, or service photos.

If **service delete** fails, run:

```
lib/supabase/migrations/003_services_delete_policy.sql
```

Hard delete is only allowed when a service has no linked appointments; otherwise use deactivate (`is_active = false`).

If **appointment edit** or **working-hours save** fails, run:

```
lib/supabase/migrations/004_appointments_and_business_settings_policies.sql
```

For **per-day working hours** and **blocked dates/times** (vacations, breaks, holidays), run:

```
lib/supabase/migrations/005_working_hours_and_blocked_times.sql
```

This adds `business_settings.working_hours` (JSONB), updates `blocked_times` for full-day and time-range blocks, and RLS policies for admin CRUD on blocked times.

For **SMS confirmation tracking** on appointments, run:

```
lib/supabase/migrations/006_sms_notifications.sql
```

For **completed status** and **internal admin notes**, run:

```
lib/supabase/migrations/007_appointment_status_and_admin_notes.sql
```

For **blocked time date ranges** (vacations and multi-day unavailable periods), run:

```
lib/supabase/migrations/008_blocked_time_ranges.sql
```

For **SMS event tracking** (confirm, cancel, reschedule notifications), run:

```
lib/supabase/migrations/009_sms_event_tracking.sql
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values under **Project Settings → API** in Supabase. Use the project URL only (not the `/rest/v1` path).

#### Optional: SMS notifications (Twilio)

Add these **server-only** variables to `.env.local` to send SMS when an admin confirms, cancels, or reschedules an appointment. Do not commit real values.

```env
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your-twilio-account-sid
SMS_AUTH_TOKEN=your-twilio-auth-token
SMS_FROM_NUMBER=+15551234567
```

If SMS credentials are missing, appointment actions still succeed and the admin sees a non-blocking warning.

Run migration `009_sms_event_tracking.sql` in Supabase to record notification history in `appointment_notifications`.

After booking at `/book`, customers are redirected to `/thank-you?appointmentId=...` with a Hebrew summary (no admin notes).

### 4. Restart the dev server

```bash
npm run dev
```

With env vars set, bookings and admin actions persist to Supabase. Remove the variables (or leave them empty) to use **localStorage demo mode** — useful for local development and automated tests without a database.

### 5. Enable admin authentication

1. In Supabase, go to **Authentication → Providers** and enable **Email**.
2. Go to **Authentication → Users** and **Add user** with an email and password for your admin account.
3. Visit **`/login`** in the app and sign in — you will be redirected to **`/admin`**.

Admin pages (`/admin`, `/admin/services`, `/admin/appointments`) redirect to `/login` when Supabase is configured and you are not signed in. In demo mode (no Supabase env vars), admin pages stay open without login.

---

## Testing

BooklyFlow has automated coverage at both the logic and browser layers.

| Suite | Count | Scope |
|---|---|---|
| Vitest unit tests | **23** | Availability engine, storage layer |
| Playwright E2E | **2** | Full booking flow, double-booking prevention |
| TypeScript build | ✓ | Strict type-checking via `next build` |

E2E tests build and start the app on port **3002** in **demo mode** (`NEXT_PUBLIC_BOOKLYFLOW_DEMO_MODE=true`) so they stay reliable without a live database — even when `.env.local` has Supabase credentials. Unit tests do not depend on Supabase Auth.

### E2E admin credentials (optional)

Default E2E runs in demo mode and does **not** require admin login. To run E2E against a Supabase-enabled build with auth protection, set:

```env
E2E_USE_SUPABASE_AUTH=true
E2E_ADMIN_EMAIL=your-admin@example.com
E2E_ADMIN_PASSWORD=your-admin-password
```

If `E2E_USE_SUPABASE_AUTH=true` but `E2E_ADMIN_EMAIL` or `E2E_ADMIN_PASSWORD` is missing, admin-dependent E2E tests are skipped with a clear message. **Do not commit real credentials** — use a local `.env` file or CI secrets only.

The double-booking E2E test only uses `/book` and does not require admin credentials.

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

- Node.js 20+
- npm
- (Optional) Supabase project for production persistence

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
2. Visit **`/login`** (Supabase mode) or **`/admin`** (demo mode) — sign in if required
3. Visit **`/admin/appointments`** — find your booking and click **Confirm**
4. Visit **`/admin`** — see updated pending, confirmed, and revenue stats

Use **Reset demo data** on the admin pages to clear `localStorage` and restore seed data (demo mode only).

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

- [ ] **Customer accounts** — Optional login for booking history
- [ ] **Email reminders** — Automated confirmation and reminder emails
- [ ] **Google Calendar** — Two-way calendar sync
- [ ] **Blocked times UI** — Admin management for `blocked_times` table
- [ ] **Deployment** — Production hosting on Vercel

---

## License

Private portfolio project. All rights reserved.

## Live Demo

https://booklyflow.vercel.app/
