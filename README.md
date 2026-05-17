# CivicPulse

**Community issue reporting platform for municipal governments.**
Citizens report local civic problems — potholes, water leaks, broken streetlights — with GPS location and photo evidence. Staff triage and resolve. The public watches live.

---

## Screenshots

> Live Map · Report Flow · Staff Queue · Admin Analytics · Transparency Dashboard

The interface uses the **Sunny Civic** design system: warm cream canvas, Caprasimo display type, frosted-glass sidebar, and ocean-blue + sunny-amber accents.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, TanStack Query, Zustand, React Router v6 |
| Styling | CSS custom properties (no Tailwind runtime), Plus Jakarta Sans, Caprasimo, DM Mono |
| Maps | MapLibre GL JS + MapTiler (free, no credit card) |
| Backend | Node 20, Express, TypeScript, Mongoose, Socket.io, Zod, Winston |
| Auth | AWS Cognito (User Pools + App Client Secret + HMAC-SHA256 SecretHash) |
| Database | MongoDB Atlas M0 (free tier) with 2dsphere index |
| File storage | AWS S3 + CloudFront (pre-signed URLs for citizen photo uploads) |
| Email | AWS Cognito built-in (OTP verification, password reset) |
| Realtime | Socket.io — `issue:new`, `issue:status_changed`, `notification` events |
| Hosting | AWS EC2 t3.micro + Nginx reverse proxy |

---

## Features

### Citizen Portal
- **Live Map** — real-time issue pins with animated pulse rings on active issues
- **Report flow** — 4-step wizard: GPS location → issue details → photo upload → review
- **Duplicate detection** — nearby issues within 50 m / 30 days surfaced before submit
- **Issue detail** — status timeline, SLA countdown bar, upvote, follow, comments
- **My Dashboard** — personal stats, full history of submitted reports
- **Notifications** — in-app alert feed, mark-all-read

### Public Portal
- **Transparency dashboard** — platform-wide stats: CountUp roll-up, 14-day trend chart, category heat map

### Staff Portal
- **Kanban queue** — issues grouped by status column, one-click status update modal
- **SLA indicators** — overdue cards highlighted in coral with `● OVERDUE` badge

### Admin Portal
- **Analytics** — user count, resolution rate, issues by status/category, trend chart
- **User management** — search, filter by role, promote citizens to staff
- **Departments** — create, rename municipal departments
- **Categories** — view all issue categories with counts
- **Audit logs** — paginated event log with actor, target, and timestamp

### Internationalisation
- Full **EN / বাংলা** toggle — persisted in localStorage, switching is instant
- Bangla rendered with Hind Siliguri from Google Fonts

---

## Project Structure

```
CIVIC-PLUS/
├── backend/                    # Node 20 + Express + TypeScript
│   ├── src/
│   │   ├── config/             # env validation (Zod), DB connection
│   │   ├── controllers/        # auth, issues, analytics, admin, uploads
│   │   ├── middleware/         # JWT verify, role guard, error handler
│   │   ├── models/             # Mongoose schemas (Issue, User, Comment, …)
│   │   ├── routes/             # Express router mounting
│   │   ├── services/           # auth (Cognito), S3, analytics logic
│   │   └── socket/             # Socket.io event emitters
│   └── package.json
│
├── frontend/                   # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/      # StatStrip, TrendChart
│   │   │   ├── feed/           # LiveTicker (Socket.io)
│   │   │   ├── layout/         # Shell, Sidebar, TopBar, CanvasHead
│   │   │   ├── map/            # PulseMap (MapLibre GL)
│   │   │   ├── timeline/       # StatusTimeline, SLABar
│   │   │   └── ui/             # Btn, Eyebrow, Field, StatusPill, RolePill, CountUp
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios client + all API helpers
│   │   │   ├── i18n.ts         # EN/BN translation table
│   │   │   ├── tokens.css      # Design system CSS variables + keyframes
│   │   │   └── useT.ts         # Translation hook
│   │   ├── screens/
│   │   │   ├── auth/           # Login, Register, VerifyEmail, Forgot/Reset
│   │   │   ├── citizen-home/   # Live map + filters + live ticker
│   │   │   ├── dashboard/      # Citizen personal dashboard
│   │   │   ├── issue-detail/   # Full issue view with timeline
│   │   │   ├── notifications/  # Notification feed
│   │   │   ├── report-flow/    # 4-step report wizard
│   │   │   ├── staff-queue/    # Kanban board
│   │   │   ├── transparency/   # Public analytics
│   │   │   └── admin/          # Analytics, Users, Departments, Categories, Audit
│   │   ├── store/              # Zustand stores (auth, theme, lang, notif, filter)
│   │   └── types/              # TypeScript interfaces (Issue, User, Comment, …)
│   └── package.json
│
├── docs/
│   ├── CivicPulse Web_V2.html      # Design prototype (web)
│   ├── CivicPulse Friendly_mobile_v2.html  # Design prototype (mobile)
│   └── graph.html              # Interactive architecture diagram
│
├── docker-compose.yml
└── CLAUDE.md                   # Full project handoff for AI agents
```

---

## Getting Started

### Prerequisites
- Node 20
- MongoDB Atlas free cluster
- AWS account (Cognito User Pool, S3 bucket, EC2 optional)
- MapTiler free API key (no credit card)

### 1 — Clone

```bash
git clone https://github.com/muntasirhossain2003/CIVIC-PLUS.git
cd CIVIC-PLUS
```

### 2 — Backend environment

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/civicpulse

# AWS Cognito
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx   # from App client settings

# AWS credentials (Learner Lab: refresh every 4 hours)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...          # required for Academy Learner Lab

# S3
AWS_S3_BUCKET=civicpulse-images

# JWT (for signing user sessions internally)
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### 3 — Frontend environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_MAPTILER_KEY=your_maptiler_key_here
```

Get your free key at [maptiler.com](https://www.maptiler.com/) — no credit card needed.

### 4 — Install and run

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Frontend: **http://localhost:5173**  
Backend API: **http://localhost:5000/api**

### 5 — Seed the database (optional)

```bash
cd backend && npm run seed
```

---

## AWS Cognito Setup

1. Create a **User Pool** in `us-east-1`
2. Add an **App client** — give it a secret (`COGNITO_CLIENT_SECRET`)
3. Under **Authentication flows**, enable:
   - `ALLOW_USER_PASSWORD_AUTH`
   - `ALLOW_REFRESH_TOKEN_AUTH`
4. Under **Sign-up**, add required attributes: `name`, `email`, `phone_number`
5. Copy `User Pool ID` and `Client ID` to backend `.env`

> **AWS Learner Lab note:** Credentials expire every 4 hours. Always include `AWS_SESSION_TOKEN` in your env. On EC2, use an IAM Instance Role instead so they rotate automatically.

---

## Architecture

```
Browser ──────► Nginx ──────► React SPA (S3/CloudFront)
                    │
                    └──────► Express API (EC2 :5000)
                                │
                    ┌───────────┼───────────────┐
                    │           │               │
               MongoDB       AWS Cognito       AWS S3
               Atlas M0      (auth/OTP)     (issue photos)
                    │
               Socket.io (real-time events)
```

---

## API Reference

All endpoints under `/api`. JWT in `Authorization: Bearer …` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Cognito SignUp (sends OTP) |
| `POST` | `/auth/confirm-email` | — | Confirm OTP, activate account |
| `POST` | `/auth/login` | — | Returns JWT + sets refresh cookie |
| `POST` | `/auth/refresh` | cookie | Rotate access token |
| `POST` | `/auth/logout` | — | Clear cookies |
| `POST` | `/auth/forgot-password` | — | Send reset code via Cognito |
| `POST` | `/auth/reset-password` | — | Confirm reset code + new password |
| `GET` | `/issues` | — | List issues (filter by status/category) |
| `GET` | `/issues/nearby` | — | Issues within radius for dup detection |
| `GET` | `/issues/:id` | — | Single issue with status history |
| `POST` | `/issues` | citizen | Submit new issue |
| `PATCH` | `/issues/:id/status` | staff | Update status with note |
| `POST` | `/issues/:id/upvote` | citizen | Idempotent upvote |
| `POST` | `/issues/:id/follow` | citizen | Subscribe to updates |
| `POST` | `/issues/:id/comments` | citizen | Add comment (500 char) |
| `POST` | `/uploads/presigned-url` | citizen | Get S3 upload URL |
| `GET` | `/analytics/public` | — | Public platform stats |
| `GET` | `/analytics/admin` | admin | Detailed admin stats |
| `GET` | `/admin/users` | admin | List + filter users |
| `PATCH` | `/admin/users/:id` | admin | Update role |
| `GET` | `/admin/departments` | admin | List departments |
| `POST` | `/admin/departments` | admin | Create department |
| `GET` | `/admin/audit-logs` | admin | Paginated audit trail |

### Socket.io events

| Event | Payload | Description |
|-------|---------|-------------|
| `issue:new` | `Issue` | New issue submitted |
| `issue:status_changed` | `{ issueId, status }` | Status update |
| `notification` | `Notification` | User-specific alert |

---

## Design System

**Sunny Civic** — warm cream + ocean blue + sunny amber.

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#F6F1E7` | Page canvas |
| `--paper` | `#FFFFFF` | Card surface |
| `--ink` | `#1A1F2E` | Primary text + dark buttons |
| `--primary` | `oklch(0.48 0.09 220)` | Ocean blue — active states |
| `--accent` | `oklch(0.82 0.14 75)` | Sunny amber — CTAs, brand |
| `--civic` | `oklch(0.68 0.13 155)` | Resolved green |
| `--alert` | `oklch(0.64 0.19 25)` | Error / overdue coral |
| `--font-display` | Caprasimo | Hero headings |
| `--font-sans` | Plus Jakarta Sans | UI body |
| `--font-mono` | DM Mono | IDs, timestamps, metadata |

Signature animations: `ring` pulse on active map pins, `blink` on live dots, `fade-up` on cards, `grow` on bar charts.

---

## Contributing

This project is a university final-year capstone. Issues and PRs are welcome.

1. Fork and create a feature branch
2. Run `npx tsc --noEmit` before committing — zero errors required
3. Follow the existing commit style: `feat(scope): description`

---

## License

MIT

---

*Built with ❤️ as a final-year project · Stack: MERN + TypeScript + AWS*
