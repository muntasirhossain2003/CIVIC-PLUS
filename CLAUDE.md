# CLAUDE.md — CivicPulse

> Handoff for Claude Code (or any developer / agent) implementing the CivicPulse
> design from `CivicPulse Prototype.html`. This file is the single source of
> truth for design tokens, component contracts, screens, and the API surface
> the UI expects.

---

## 1 · Project at a glance

**CivicPulse** — community issue reporting platform. Citizens report local
civic issues (potholes, water leaks, garbage, streetlights, drainage, power)
with geolocation + photo evidence. Municipal staff triage, assign, and
resolve. Public sees a live transparency ledger.

- Stack: **MERN + TypeScript + AWS** (per SRS v1.0)
- Frontend: React 18, Vite, Tailwind, shadcn/ui, TanStack Query, Zustand,
  React Hook Form + Zod, Mapbox GL JS, Socket.io-client, Recharts
- Backend: Node 20, Express, Mongoose, Socket.io, JWT, Zod, Winston
- AWS: EC2, S3 (images), CloudFront, SES (email), Secrets Manager
- DB: MongoDB Atlas (`2dsphere` index on `issues.location`)

The prototype HTML in this project is **the design reference** — every screen,
animation, and state in the live React app should match it visually.

---

## 2 · Aesthetic — "Civic Blueprint"

Editorial-meets-municipal-blueprint. Midnight navy canvas with a faint grid,
cream "paper" inserts for reporter content, and a single electric **pulse**
accent that drives all live/active states. Editorial display serif anchors
each screen with weight; mono is used for IDs, coordinates, timestamps, and
all technical chrome.

### Type pairing
| Role     | Family             | Notes                                        |
|----------|--------------------|----------------------------------------------|
| Display  | Instrument Serif   | Italics carry the brand voice (`Civic*Pulse*`) |
| Sans     | Space Grotesk      | UI body, buttons, controls                   |
| Mono     | JetBrains Mono     | IDs, coords, timestamps, eyebrows, technical chrome |

Always import from Google Fonts. Italic phrases in display type are an
intentional motif — use them sparingly for one or two emphasized words per
heading (e.g. *visible*, *timed*, *Dhaka*).

### Color tokens (CSS custom properties)
```css
--ink:        #0B1220;   /* primary canvas */
--ink-2:      #131D33;   /* card surface */
--ink-3:      #1B2740;   /* nested surface */
--line:       rgba(245, 235, 215, 0.10);
--line-2:     rgba(245, 235, 215, 0.18);
--paper:      #F2EBDD;   /* "reporter quote" surface */
--paper-2:    #E7DFCB;
--paper-line: rgba(11, 18, 32, 0.10);
--bone:       #F5F1E8;   /* primary text on dark */
--muted:      #94A3BC;
--muted-2:    #6A7790;
--pulse:      oklch(0.78 0.16 65);   /* electric amber — live/active */
--pulse-soft: oklch(0.78 0.16 65 / 0.18);
--civic:      oklch(0.70 0.13 152);  /* resolved green */
--alert:      oklch(0.66 0.21 25);   /* overdue red */
--sky:        oklch(0.74 0.10 230);  /* in-progress blue */
```

The accent is tweakable — see the `Tweaks` panel in the prototype. Other
options provided: cyan / rose / violet, all sharing the same chroma+lightness
so the entire UI re-tones cleanly.

### Status → color map
| Status         | Token         | Use                                |
|----------------|---------------|------------------------------------|
| `submitted`    | `--muted`     | New, not yet triaged               |
| `acknowledged` | `--pulse`     | Triaged, queued                    |
| `in_progress`  | `--sky`       | Crew dispatched / actively working |
| `resolved`     | `--civic`     | Closed successfully                |
| `rejected`     | `--alert`     | Duplicate / out-of-scope / invalid |

Each status pill: `border + dot + uppercase mono label, 0.14em tracking`.

### Spacing & rhythm
- Screen padding: `28px 48px` (comfortable) / `20px 32px` (compact tweak)
- Card border-radius: `4px` (sharp, document-like — never pill-rounded)
- Card chrome: optional `corner-ticks` ornament — top-left + bottom-right L-marks in `--pulse`. Use on hero/feature cards.
- Section gap: `24–32px` between row groups
- Body grid backdrop: 64px squares, masked to a soft radial vignette

---

## 3 · Signature motion (do not skip)

The brand is *Civic **Pulse*** — motion is the brand. Every "live" surface
should literally pulse. Implement these in CSS keyframes (no JS animation
library required for v1):

1. **Map pin pulse rings** — three concentric rings emanate at `pulse-ring 2.6s ease-out infinite` with `0s / 0.9s / 1.8s` delays. Pin color = status color. Only `acknowledged` and `in_progress` issues animate; `submitted` and `resolved` are static.
2. **Brand mark** — same pattern at 22px, two rings, 1.2s offset.
3. **Live dot** — `live-blink 1.4s ease-in-out infinite` (opacity + box-shadow halo). Used in nav, headers, ticker chips.
4. **Counter roll-up** — `requestAnimationFrame` ease-out cubic, `~1.4s`. Every stat number on Transparency animates on mount.
5. **Trend chart** — `stroke-dashoffset` draw-on animation over 1.4s.
6. **Timeline current step** — pulse rings on the active status node only.
7. **Ticker bump** — new feed item flashes `--pulse-soft` background for ~0.8s as it slides in.
8. **Card enter** — `fade-up 0.5s` with staggered delays on lists.

Respect `prefers-reduced-motion` — wrap all infinite animations behind a
media query in production.

---

## 4 · Information architecture

5 screens, three portals, all in one prototype shell:

| #   | Screen          | Portal      | Component (in `screens.jsx`) |
|-----|-----------------|-------------|------------------------------|
| 01  | Live Map        | Citizen     | `<CitizenHome>`              |
| 02  | Report flow     | Citizen     | `<ReportFlow>`               |
| 03  | Issue Detail    | Citizen     | `<IssueDetail>`              |
| 04  | Transparency    | Public      | `<Transparency>`             |
| 05  | Staff Queue     | Staff/Admin | `<StaffQueue>`               |

Sidebar is persistent (280px). Each item shows a numbered index + portal tag.
Active item gets a glowing pulse rail on the left edge.

---

## 5 · Component inventory

Build these as real shadcn/ui-flavored components when porting to the
production codebase. Names map 1:1 with the prototype.

### Atoms
- `<StatusPill status>` — colored bordered pill, mono label, dot swatch
- `<Eyebrow>` — uppercase mono label, 0.18em tracking, `--muted` color
- `<RolePill>` — outlined pill with pulsing dot — used for badges (`STAFF`, `2 OVERDUE`)
- `<Btn variant="primary|ghost">` — primary uses `--pulse`, hover lifts 1px and adds 4px halo
- `<CountUp to>` — animated counter, eased cubic
- `<PulseRings>` — 3 stacked rings, configurable color
- `<Field label textarea?>` — input with eyebrow label

### Molecules
- `<StatStrip>` — 4-column grid of (eyebrow + huge serif number + mono sub-line)
- `<StatusTimeline events current>` — vertical line + status nodes; current node pulses
- `<SLABar usedHours totalHours>` — gradient bar, tabular labels
- `<MapPin issue active>` — single map pin with optional pulse rings
- `<LiveTicker>` — fixed-height list, new items prepend with pulse-soft flash. Wires to Socket.io in production.

### Organisms
- `<PulseMap issues onPick picked height>` — full map with pins. v1 uses an SVG blueprint backdrop; production swaps in Mapbox GL JS but **keeps the pulse-ring layer** drawn as React DOM children positioned by lat/lng → pixel.
- `<TrendChart data>` — 14-day reported vs. resolved. Reported is a filled area + stroked path; resolved is dashed.
- `<Heatmap>` — 8×6 grid of OKLCH-tinted cells, fade-up stagger.
- `<KanbanColumn status cards>` — column header with status color, draggable card stack. Overdue cards get `--alert` border.
- `<DuplicateDetectionCard>` — paper-themed warning surface shown after step 2 of report flow.

### Layout
- `<Shell>` — `grid-template-columns: 280px 1fr`
- `<Sidebar>` — persistent nav, brand, role pill at foot
- `<CanvasHead>` — eyebrow + huge serif title on left, "system healthy" mono block on right

---

## 6 · Data shape (mirrors SRS §6)

```ts
type Issue = {
  _id: string;            // "CP-2841" in UI; ObjectId in DB
  title: string;          // 5–100 chars
  description: string;    // 20–1000 chars
  category: 'pothole' | 'streetlight' | 'garbage' | 'water' | 'drainage' | 'power' | 'other';
  severity: 'low' | 'medium' | 'high';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
  location: { type: 'Point'; coordinates: [lng: number, lat: number] };  // 2dsphere
  address: string;
  photos: string[];           // S3 keys
  reporterId: ObjectId;
  assignedDepartmentId?: ObjectId;
  assignedStaffId?: ObjectId;
  upvoteCount: number;
  followerCount: number;
  duplicateClusterId?: ObjectId;
  resolutionNotes?: string;
  resolutionPhotos?: string[];
  rejectionReason?: string;
  statusHistory: { status; changedBy; changedAt; note? }[];
  slaDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

Mock data in the prototype lives in `data.jsx` — categories, status order, 9
sample issues, ticker entries, 14-day trend, kanban queue. Use it to seed
your `civicpulse-api` dev DB when wiring up.

---

## 7 · API contract (UI expects these)

All paths under `/api`. JWT in `Authorization: Bearer …` header (15-min
access token). Refresh token in httpOnly cookie.

| Method | Path                           | Used by screen     | Notes                                    |
|--------|--------------------------------|--------------------|------------------------------------------|
| POST   | `/auth/register`               | Auth (TBD)         | Email verification required              |
| POST   | `/auth/login`                  | Auth (TBD)         | Returns access JWT + sets refresh cookie |
| POST   | `/auth/refresh`                | All                |                                          |
| POST   | `/auth/forgot-password`        | Auth (TBD)         | 1-hour reset link via SES                |
| GET    | `/issues?filters&page`         | Map · Staff Queue  | Pagination 20/page                       |
| GET    | `/issues/nearby?lng&lat&r`     | Report Flow (dup)  | 50m / 30d duplicate query                |
| GET    | `/issues/:id`                  | Issue Detail       | Includes `statusHistory`                 |
| POST   | `/issues`                      | Report Flow        | Submit after photo upload                |
| PATCH  | `/issues/:id/status`           | Staff Queue        | Append to statusHistory                  |
| POST   | `/issues/:id/upvote`           | Detail             | Idempotent — unique compound index       |
| POST   | `/issues/:id/follow`           | Detail             |                                          |
| POST   | `/issues/:id/comments`         | Detail             | 500 char max                             |
| POST   | `/uploads/presigned-url`       | Report Flow        | Returns S3 URL valid 5 min               |
| GET    | `/analytics/public`            | Transparency       | No auth required                         |
| GET    | `/analytics/admin`             | (Admin TBD)        |                                          |
| GET    | `/admin/users`                 | (Admin TBD)        |                                          |

Real-time (Socket.io) events the UI subscribes to:
- `issue:new` — prepend to ticker
- `issue:status_changed` — refetch detail + update map pin color
- `notification` — bell icon

---

## 8 · Repo structure (suggested for `civicpulse-web`)

```
src/
├── app/                 # router, layout shell
├── screens/             # one folder per screen
│   ├── citizen-home/
│   ├── report-flow/
│   ├── issue-detail/
│   ├── transparency/
│   └── staff-queue/
├── components/
│   ├── ui/              # atoms (StatusPill, Btn, Eyebrow, CountUp…)
│   ├── map/             # PulseMap, MapPin
│   ├── feed/            # LiveTicker
│   ├── timeline/        # StatusTimeline, SLABar
│   └── analytics/       # TrendChart, Heatmap, StatStrip
├── lib/
│   ├── api.ts           # TanStack Query clients
│   ├── socket.ts        # Socket.io setup
│   └── tokens.css       # the CSS variables above
├── store/               # Zustand
└── types/               # Issue, User, Comment, etc.
```

---

## 9 · Acceptance — "matches the prototype" means

1. Every screen renders at parity with the prototype HTML at 1280–1920px wide.
2. Pulse rings animate on every `acknowledged`/`in_progress` map pin.
3. Counters roll up on first paint of Transparency; trend chart draws over 1.4s.
4. Status timeline pulse-rings the *current* node, not all of them.
5. Report flow's duplicate-detection card uses the cream `--paper` surface,
   not the dark canvas — this contrast is intentional.
6. Italic emphasis appears on at least one word per screen title.
7. Eyebrow + giant serif + mono substring is the canonical heading rhythm.
   Avoid bold sans titles.
8. Staff queue overdue cards have `--alert` border and a mono `● OVERDUE` tag.
9. Mobile (<768px): sidebar collapses to a top bar; map fills viewport;
   stats stack vertically.
10. WCAG 2.1 AA — every status conveys meaning by *both* color and label.

---

## 10 · Out of scope for v1 (per SRS §10)

Native apps · offline mode · multi-tenant · SMS · AI image classification ·
public API · voice reports. Note these in your CV/interview talk track as the
v2 roadmap.

---

## 11 · AWS Learner Lab constraints

The project runs on **AWS Academy Learner Lab**. Keep these hard limits in mind at all times:

| Concern | Rule |
|---------|------|
| **Credentials** | Temporary — expire every 4 hours. Never hardcode. Always read from env vars or instance role. |
| **Session token** | Lab credentials include `AWS_SESSION_TOKEN`. All SDK calls must include it. |
| **EC2** | Use `t2.micro` or `t3.micro` only. Stop when not in use — credits are limited. |
| **SES** | Starts in **sandbox** — only verified emails can receive. Request production early, or use verified test addresses during dev. |
| **Secrets Manager** | Available in Learner Lab. Use it for JWT secret + DB URI in production. |
| **CloudFront** | Available. Use for React build CDN + API cache headers. |
| **Route 53** | Often restricted in Learner Lab. Fallback: use EC2 public IP / Elastic IP + nip.io domain. |
| **ACM** | Tied to Route 53/CloudFront — verify availability before relying on it. |
| **MongoDB Atlas** | External (not AWS) — free M0 tier. Whitelist EC2 IP in Atlas network access settings. |
| **Billing alarm** | Set a $5 and $10 CloudWatch billing alarm on Day 1. |
| **Regions** | Stick to `us-east-1` unless instructed otherwise — Lab quotas are region-specific. |

### Local dev AWS setup (`.env`)
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...          # required for Learner Lab
AWS_REGION=us-east-1
AWS_S3_BUCKET=civicpulse-images
AWS_SES_FROM=noreply@yourdomain.com
```

On EC2, prefer an **IAM Instance Role** so credentials rotate automatically.

---

## 12 · Architecture diagram

An interactive HTML architecture graph lives at `docs/graph.html`.  
Open it in a browser — it has 7 tabs:

| Tab | Content |
|-----|---------|
| System Architecture | Full AWS stack diagram |
| Backend | Express routes → controllers → services → models |
| Frontend | React Router tree + Zustand stores |
| Data Model | MongoDB ER diagram (all 9 collections) |
| Issue Lifecycle | Status state machine + duplicate-detection flow |
| User Roles | Citizen / Staff / Admin capability matrix |
| Folder Structure | Full planned file tree for both repos |

Design prototype is at `docs/CivicPulse Prototype.html`.

---

## 13 · Repo layout (monorepo)

```
CIVIC-PLUS/
├── backend/         # civicpulse-api  (Node 20 + Express + TypeScript)
├── frontend/        # civicpulse-web  (React 18 + Vite + TypeScript)
├── docs/            # graph.html, prototype, SRS
├── CLAUDE.md        # this file
├── docker-compose.yml
└── .gitignore
```

GitHub: https://github.com/muntasirhossain2003/CIVIC-PLUS

— end of handoff —
