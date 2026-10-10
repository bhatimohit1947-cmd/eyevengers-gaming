# EYE<span style="color:#E8C477">VENGERS</span> — Festive Gaming & Rewards Platform

> **Official Festive Promotional Platform for EYEVENGERS Optical Showroom**  
> *Sardarpura 9th C Road, Near Jaljog Circle, Jodhpur, Rajasthan 342001, India*

---

## 1. Project Overview

EYEVENGERS is a production-oriented, full-stack festive gaming and digital rewards web application. It engages customers during Rajasthan's festive celebrations (Navratri, Diwali, Holi) with interactive games, authentic admission-ticket styled vouchers, and instant showroom QR code redemptions.

### Core Features

- **Public Festive Homepage**:
  - Promotional offer banner slider with manual and autoplay controls.
  - Immersive hero section with headline *"PLAY. SPIN. WIN."*, Indian mandalas, and haveli/jharokha toran motifs.
  - Interactive game cards for **Lucky Spin Wheel** and **Mystery Boxes**.
  - Showroom service highlights and official address / contact information.
- **Customer Authentication**:
  - Mobile number + password registration with automatic `+91` normalization and duplicate detection.
  - Password hashing with `bcrypt` (never stored in plaintext).
  - Secure HTTP-only JWT sessions.
  - Password reset flow with SMS OTP provider abstraction.
- **Two Interactive Festive Games**:
  - **Lucky Spin Wheel**: High-resolution canvas prize wheel with jewel festive segments, Indian mandala hub, realistic easing physics, stopping accurately on the server-assigned slice.
  - **Mystery Boxes**: Interactive perspective 3D gift boxes with hover tilts, golden ribbons, box opening animation, and radiant reward reveals.
  - **Cryptographic Server-Side Allocation Engine**: Rewards are determined and committed in an atomic database transaction *before* client visual reveals. Client manipulation or double-clicking is prevented.
- **Digital Admission-Ticket Vouchers & PDF**:
  - Ticket aesthetic inspired by festive event passes: perforated cutouts, golden double borders, Jodhpur heritage badge, terms, and QR code.
  - Real downloadable high-resolution PDF generated via `jsPDF` with ₹ Unicode representation.
- **Showroom Staff Redemption Desk (`/staff/redeem`)**:
  - Dedicated authorized desk for scanning voucher QR codes or entering codes manually.
  - Validation checks: unknown codes, expired vouchers, cancelled vouchers, already-redeemed vouchers.
  - Concurrency-safe atomic redemption transaction recording staff desk, invoice reference, and purchase amount.
- **Admin Dashboard (`/admin`)**:
  - **Overview**: Real-time metrics (customers, plays, vouchers issued, redeemed, remaining stock, redemption %, cost in ₹).
  - **Campaign Manager**: Schedule dates, switch festival themes (Navratri, Diwali, Holi), toggle games, configure play limits.
  - **Reward & Odds Manager**: Manage stock inventory, probability sliders (with 100% sum validation), discount amounts, and terms.
  - **Banner Manager**: Control homepage carousel slides, order, and CTAs.
  - **Voucher Registry**: Filter, inspect, and revoke vouchers with logged reason.
  - **Customer & Staff Management**: View accounts, create showroom staff logins.
  - **Audit Trail**: Immutable log of administrative changes.

---

## 2. Technology Stack & Design System

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS with custom Indian festive tokens:
  - Deep Maroon: `#681F2B`
  - Festive Red: `#C93B3B`
  - Coral: `#FF5149`
  - Antique Gold: `#E8C477` / `#D4AF37` / `#FFF1CF`
  - Warm Cream: `#FFF4E3`
  - Deep Charcoal: `#21171A`
- **Database Architecture**:
  - **Dual-Mode Engine**: Standalone local zero-config ACID database engine (powered by Node.js built-in `node:sqlite` in `.data/eyevengers.db`), fully mirrored for production PostgreSQL / Supabase in `supabase/migrations/` and `supabase/seed.sql`.
- **Security & Cryptography**:
  - `bcryptjs` password hashing with 10 salt rounds.
  - `jose` HS256 signed JWT cookies.
  - `crypto.randomBytes` cryptographic random engine.
- **PDF & QR Code Generation**:
  - `jspdf` ticket document rendering.
  - `qrcode` matrix generation.
- **Celebration Effects**:
  - `canvas-confetti` golden particle fireworks.
- **Icons**: `lucide-react`.

---

## 3. Seed Testing Credentials

The development database seeds automatically on first run with the following test credentials:

| Role | Mobile Number | Password | Permitted Areas |
| :--- | :--- | :--- | :--- |
| **Administrator** | `+919876500001` | `Eyevengers@Admin2026` | Full Admin Dashboard (`/admin`), campaigns, rewards, audit trail |
| **Showroom Staff** | `+919876500002` | `Eyevengers@Staff2026` | Showroom Redemption Desk (`/staff/redeem`) |
| **Customer** | `+919876543210` | `Customer@123` | Customer Wallet (`/my-rewards`), Lucky Spin, Mystery Boxes |

> *Tip: The Login page (`/auth/login`) includes one-click quick test buttons to autofill these credentials.*

---

## 4. Local Development Quickstart

### Prerequisites
- Node.js 20+ (Node.js 24 installed in workspace).
- npm 10+.

### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Run Automated Test Suite**:
   ```bash
   npm test
   ```
   *Runs tests for password hashing, mobile normalization, reward probability distribution, stock exhaustion, and voucher redemption concurrency.*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 5. Supabase PostgreSQL Deployment Guide

To deploy the database to Supabase:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261010_initial_schema.sql` and run the script to create tables, constraints, indexes, and Row-Level Security policies.
4. Open `supabase/seed.sql` and run it to populate campaigns, banners, default reward pools, and admin profiles.
5. In your production `.env` (or Vercel / hosting environment variables), configure:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

---

## 6. Showroom Verification & QR Code Security

1. When a customer wins a reward, the server issues a ticket voucher with a cryptographically unique 40-character `qrToken`.
2. The voucher QR code encodes the verification URL:
   `https://eyevengers.com/staff/redeem?token={qrToken}`
3. When the showroom staff executive scans the QR code using their camera or enters the voucher code manually:
   - The server verifies voucher existence, expiration date, and status.
   - If valid, the staff member confirms the redemption and optionally inputs the customer's optical invoice number and billed amount.
   - The transaction locks atomically: double redemptions and race conditions are strictly rejected.
   - The customer's digital voucher immediately reflects `Redeemed` status.

---

## 7. Folder Structure

```
gameweb/
├── .data/                           # Persistent local ACID database (eyevengers.db)
├── src/
│   ├── app/
│   │   ├── admin/                   # Admin Dashboard & sub-managers
│   │   ├── api/                     # Backend REST API routes
│   │   ├── auth/                    # Registration, Login, Forgot Password
│   │   ├── games/                   # Lucky Spin & Mystery Boxes pages
│   │   ├── my-rewards/              # Customer Rewards Wallet
│   │   ├── staff/redeem/            # Showroom Redemption Desk
│   │   ├── privacy/ & terms/        # Showroom terms & privacy policy
│   │   ├── globals.css              # Indian festive styling & ticket perforations
│   │   ├── layout.tsx & page.tsx    # Root layout & Homepage
│   ├── components/
│   │   ├── games/                   # SpinWheelGame & MysteryBoxesGame
│   │   ├── home/                    # HeroSection, BannerSlider, GameCards
│   │   ├── layout/                  # Navbar, Footer
│   │   ├── ui/                      # BrandLogo, FestiveMotifs (Mandala, Toran, Diya)
│   │   └── voucher/                 # TicketVoucherCard with PDF & QR zoom
│   ├── lib/
│   │   ├── auth/                    # Passwords, JWT sessions, SMS OTP provider
│   │   ├── db/                      # Unified database repository & seed logic
│   │   ├── pdf/                     # Ticket PDF generator (jsPDF)
│   │   ├── rewards/                 # Cryptographic server allocation engine
│   │   ├── theme.ts                 # Navratri, Diwali, Holi tokens & showroom info
│   │   └── types.ts                 # Strict TypeScript schemas
│   └── types/                       # Ambient type declarations
├── supabase/
│   ├── migrations/                  # Full PostgreSQL initial migration
│   └── seed.sql                     # Seed script for Supabase
├── tests/                           # Unit & integration test suites
├── .env.example                     # Environment template
└── package.json
```

---

## 8. License

Proprietary — Developed exclusively for **EYEVENGERS**, Jodhpur, Rajasthan, India.
