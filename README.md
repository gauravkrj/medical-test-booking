# Lab Test Booking System

A single-lab medical test booking system with comprehensive admin panel.

## Features

### Authentication, Authorization, Sessions
- Credentials sign-in with email/password; passwords hashed with bcrypt
- Roles: `USER`, `ADMIN` embedded into JWT and session
- Session strategy: JWT; `session.user.id` and `session.user.role` available client/server
- Protected server routes use centralized `auth()` (NextAuth v5) to get session
- Client wrapped in `SessionProvider`; UI shows role-based links/actions
- Redirects: unauthenticated admin access → login; role-only pages require `ADMIN`

### Database & Data Model (Prisma + MySQL)
- Models:
  - `User`: id, email, name, phone, password, role, timestamps
  - `Test`: id, name, description, category, price, duration, `testType`, `isActive`, rich sections, `faqsJson`
  - `Booking`: id, userId, `bookingType`, patient details, date/time, address, status, prescriptionUrl, notes, totalAmount
  - `BookingItem`: bookingId, testId, price
  - `SiteConfig`: single record for lab branding and content
- Indexes on hot fields: tests (`testType`, `category`, `isActive`), bookings (`userId`, `bookingDate`, `status`, `bookingType`)

### Dev Environment & Migrations
- Docker MySQL 8 via `docker-compose.yml` (user `labuser` / `labpassword`)
- Local `DATABASE_URL` without SSL params (prevents TLS errors)
- Prisma: `npx prisma generate` and `npx prisma db push`
- Seed script `prisma/seed.ts` creates Admin and User test accounts

### File Uploads (Cloudinary)
- API: `POST /api/upload`
- Validates `CLOUDINARY_*` credentials; clear 4xx/5xx errors
- Auto-detects mimetype; PDFs uploaded with `resource_type=raw` for inline viewing; images as `auto`
- Returns `secure_url`, `public_id`, `resourceType`, `format`; max size 10MB

### Public UX (User-Facing)
- Home: Hero, marketing features (Easy Booking, Fast Results, Secure), stats
- Tests listing (`/tests`): active tests from `GET /api/tests`, search & category filters
- Test details (`/tests/[id]`): sections (About, Parameters, Preparation, Why, Interpretations), FAQs accordion, Book Now
- Booking flow (`/tests/[id]/book`):
  - Requires login; Clinic Visit and Home Collection modes
  - Validates patient info; address required for Home; optional date/time for Clinic
  - Optional prescription upload (images/PDFs) opens inline after upload
  - Creates booking and redirects to confirmation
- My Bookings (`/(user)/bookings`): list with status, type, meta, prescription link
- Booking Details (`/bookings/[id]`): full receipt-like view

### Admin UX (Role: ADMIN)
- Admin layout with sidebar (Dashboard, Tests, Bookings, Users, Settings)
- Dashboard: stats (tests, bookings, users, revenue), quick actions
- Tests: list/create/edit/delete or deactivate; rich content and FAQs builder
- Bookings: filters by status/type, inline status update, details link
- Users: list with role and bookings count
- Settings: manage single `SiteConfig` (lab info, logo upload via Cloudinary, colors, content)

### APIs (Behavioral Details)
- Public:
  - `GET /api/tests`: search, category; only `isActive=true`
  - `GET /api/tests/[id]`: single active test
  - `GET /api/settings`: public site configuration
- Auth:
  - NextAuth v5 at `/api/auth/[...nextauth]` with centralized handlers
- User (requires `auth()`):
  - `GET /api/bookings`: current user bookings
  - `GET /api/bookings/[id]`: own booking (ADMIN can view any)
  - `POST /api/bookings`: validates payload, calculates total, creates booking + items (`status=PENDING`)
- Admin (requires `ADMIN`):
  - Tests: `GET/POST /api/admin/tests`, `GET/PATCH/DELETE /api/admin/tests/[id]`
  - Bookings: `GET /api/admin/bookings`, `GET/PATCH /api/admin/bookings/[id]`
  - Users: `GET /api/admin/users`
  - Settings: `GET/POST /api/admin/settings`

### UI/UX Details
- Dark theme with gradients and glassmorphism; responsive
- Buttons: primary/secondary/ghost/danger; loading states
- Accessible Inputs/Textareas with labels and hints
- Category chips with active styles; smooth hover/scale transitions

### Performance & Stability
- Server routes marked dynamic where needed; Node runtime where appropriate
- Centralized NextAuth instance; Prisma client singleton
- Defensive checks on arrays and optional content

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **MySQL** - Database
- **NextAuth.js** - Authentication
- **Tailwind CSS v4** - Styling
- **Cloudinary** - File uploads

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

3. **Set up database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Create admin user:**
   - Use Prisma Studio or create manually via API
   - Set role to `ADMIN`

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public routes
│   │   ├── page.tsx       # Homepage
│   │   ├── tests/         # Test listing
│   │   ├── login/
│   │   └── signup/
│   ├── (user)/            # User routes
│   │   └── bookings/      # User bookings
│   ├── admin/             # Admin panel
│   │   ├── dashboard/
│   │   ├── tests/
│   │   ├── bookings/
│   │   ├── users/
│   │   └── settings/
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature components
├── lib/
│   ├── prisma.ts          # Prisma client
│   └── auth.ts            # NextAuth config
└── types/                 # TypeScript types
```

## Database Schema

- **User** - User accounts (USER/ADMIN roles)
- **Test** - Medical tests
- **Booking** - User bookings
- **BookingItem** - Tests in a booking
- **SiteConfig** - Lab branding and configuration

## Next Steps

1. Wire `SiteConfig` (logo/colors/text) into public UI
2. Add email notifications on booking status changes
3. Prepare production env vars and deployment (Vercel + managed DB)
