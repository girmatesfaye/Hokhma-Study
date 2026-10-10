# Hokhma Study — Backend Integration Roadmap

## Architecture Overview

```text
React Frontend
(Vite + Tailwind)
       |
   HTTP + JWT
       |
Express REST API
(Node.js)
       |
       +-- Mongoose ODM --> MongoDB (Mongoose)
       +-- Multer Upload --> Cloudinary / Local (Cover Images)
       +-- Nodemailer --> Contact Form
       +-- Email + Password --> Seeded Admin Sign-In
       +-- Analytics Events --> MongoDB --> Admin Statistics
```

## Phase 1 — Backend Project Setup

**Goal:** Runnable Express server connected to MongoDB.

### Tasks

1. Initialize `backend/package.json` — install dependencies and tooling:
   ```sh
   npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken express-rate-limit express-validator multer cloudinary multer-storage-cloudinary nodemailer
   npm install -D nodemon
   ```
   Configure `"type": "module"` in `package.json` for ES Module support (`import`/`export`), and define npm scripts:
   ```json
   "scripts": {
     "start": "node src/server.js",
     "dev": "nodemon src/server.js",
     "seed": "node src/seed/seed.js",
     "seed:admin": "node src/seed/seedAdmin.js"
   }
   ```
2. Create the full folder structure (see below).
3. Configure `.env` with:
   - Server & Auth: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`
   - Image Cloud Storage: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Mail Service: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_RECEIVER_EMAIL`
   - One-Time Admin Setup (backend-only, remove after seed): `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, `INITIAL_ADMIN_NAME`. Never expose these through frontend `VITE_*` variables, commit them, or log them.
4. `src/config/db.js` — Mongoose connect with error logging and global `toJSON` transformation.
5. `src/app.js` — wire up middleware: `cors`, `helmet`, `morgan`, and `express.json()`.
6. `src/server.js` — `app.listen()` entry point.
7. Verify: `GET /api/health` returns `{ status: "ok" }`.

### Backend Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Article.js
│   │   ├── Topic.js
│   │   ├── Question.js
│   │   ├── LearningPath.js
│   │   ├── Resource.js
│   │   ├── Comment.js
│   │   ├── ContactMessage.js
│   │   ├── QuestionSubmission.js
│   │   ├── Admin.js
│   │   ├── AnalyticsEvent.js
│   │   └── SiteSettings.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── analytics.routes.js
│   │   ├── articles.routes.js
│   │   ├── topics.routes.js
│   │   ├── questions.routes.js
│   │   ├── paths.routes.js
│   │   ├── resources.routes.js
│   │   ├── comments.routes.js
│   │   ├── contact.routes.js
│   │   ├── search.routes.js
│   │   ├── settings.routes.js
│   │   └── upload.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── analytics.controller.js
│   │   ├── articles.controller.js
│   │   ├── topics.controller.js
│   │   ├── questions.controller.js
│   │   ├── paths.controller.js
│   │   ├── resources.controller.js
│   │   ├── comments.controller.js
│   │   ├── contact.controller.js
│   │   ├── search.controller.js
│   │   └── settings.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── upload.middleware.js
│   ├── utils/
│   │   └── slugify.js
│   ├── seed/
│   │   ├── seed.js
│   │   └── seedAdmin.js
│   ├── app.js
│   └── server.js
├── .env
└── package.json
```

## Phase 2 — Mongoose Models

**Goal:** Every `types.ts` interface maps to a validated Mongoose schema.

| Frontend Type | Backend Model | Key Notes |
| --- | --- | --- |
| `Article` | `Article.js` | `content[]` as a subdocument array; `reactions` counter object (`helpful`, `insightful`, `rigorous`); MongoDB text and regex index on `title` + `tags`. |
| `Topic` | `Topic.js` | `articleCount` is a virtual (computed from `Article.count`), or maintained manually. |
| `Question` | `Question.js` | Reference to `Article` by `articleSlug`; stores denormalized `articleTitle` and `articleTitleAm` for instant UI rendering without secondary lookups. |
| `LearningPath` + `LearningPathStep` | `LearningPath.js` | `steps[]` as embedded subdocuments. |
| `Resource` | `Resource.js` | Enum validation for `category`. |
| `Comment` | `Comment.js` | `isApproved` defaults to `false`. Public reader queries filter exclusively for `isApproved: true`. |
| `ContactMessage` | `ContactMessage.js` | `isRead` defaults to `false`; `submittedAt` defaults to `Date.now`. |
| `QuestionSubmission` | `QuestionSubmission.js` | `status` enum: `pending` / `reviewed`. |
| `AuthorProfile` + `FaithStatement` | `SiteSettings.js` | Single singleton document (one document, always upserted). |
| (New) | `Admin.js` | Normalized unique `email`, required `passwordHash` (bcrypt), `name`, and `isActive` (defaults to `true`). Never store plaintext passwords or return the hash in API responses. |
| (New) | `AnalyticsEvent.js` | `eventId`, `type: page_view`, canonical `path`, optional `articleId`, anonymous `sessionId`, optional anonymous `visitorId`, referrer hostname, and server-generated `occurredAt`. Unique index on `eventId`, reporting indexes on `occurredAt` and `{ path, occurredAt }`, and a 90-day TTL index on `occurredAt`. |

### Important Schema Decisions

- **Global ID Normalization (`_id` → `id`):** Apply a global Mongoose `toJSON` plugin across all schemas:
  ```js
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  });
  ```
  This guarantees frontend code expecting `item.id` (React list keys, route parameters, editor lookups) works without breaking or requiring frontend field renaming.
- `Article.reactions` — subdocument `{ helpful: { type: Number, default: 0 }, insightful: { type: Number, default: 0 }, rigorous: { type: Number, default: 0 } }`, incremented/decremented atomically with `$inc`.
- `Article.content[]` — array of mixed subdocuments (`paragraph` / `header` / `scripture` / `list`).
- `Question` Title Persistence — `articleTitle` and `articleTitleAm` are saved directly on the question document during creation/mapping, ensuring question cards render complete references without extra joins.
- Add `createdAt` / `updatedAt` with Mongoose `timestamps: true` on every model.
- Add MongoDB text indexes on `Article` (`title`, `titleAm`, `tags`, `excerpt`) and `Question` (`text`, `textAm`) for Phase 8 search.

## Phase 3 — Authentication

**Goal:** Replace the fake login with real JWT auth for a seeded email/password admin account.

Authentication is required only for admins. Readers browse and submit public forms without accounts. There is no public registration or Google sign-in.

### Simple Admin Login Flow

1. Run the admin seed script once to create the approved admin account with a bcrypt password hash.
2. Enter that email and password on the admin login page.
3. The backend verifies the credentials and active status, then issues an application JWT.
4. Every protected API request verifies the JWT and checks that the admin still exists and is active.

Seeding creates the account; login authenticates the person using it. Knowing the admin email alone does not grant access.

### Backend

1. `POST /api/auth/login` — validate email + bcrypt-compare password → return signed JWT (24-hour expiry).
2. `src/middleware/auth.middleware.js` — `verifyToken` extracts and validates `Authorization: Bearer <token>`.
3. Create the first admin via `src/seed/seedAdmin.js` (not a public registration endpoint); see Phase 5.
4. Issue an application JWT containing the admin ID; protected middleware must also check that the admin still exists and `isActive` is `true`.
5. Return a generic invalid-credentials response for unknown emails, wrong passwords, and disabled accounts. Rate-limit login attempts and never log passwords or tokens.

### Frontend (`src/pages/AdminLogin.tsx`)

1. Remove hardcoded credentials from `useState` initial values.
2. Replace the fake `loginAdmin()` call with `POST /api/auth/login`.
3. On success: store JWT in `localStorage` (key: `hokhma_token`).
4. On failure: show the real error from the server response.

### Frontend (`src/context/AppContext.tsx`)

1. Add a `token` state initialized from `localStorage.getItem('hokhma_token')`.
2. `loginAdmin()` — now stores the token; `logoutAdmin()` — removes it.
3. All protected API calls attach `Authorization: Bearer ${token}`.

### Authentication Checks

- Correct credentials for an active seeded admin allow access to protected routes.
- Unknown emails, wrong passwords, and disabled accounts cannot log in.
- Missing, expired, or tampered application JWTs are rejected.
- Disabled or deleted admins lose access even with an unexpired JWT.
- Public pages remain accessible without login; content management and statistics reports require admin authentication.
- Rerunning admin setup does not overwrite an existing account or reset its password.

## Phase 4 — REST API Endpoints

**Goal:** Full CRUD for every content type.

### Public Routes (No Auth)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/articles` | All published articles (supports `?topic=&difficulty=&lang=&featured=`). |
| GET | `/api/articles/:slug` | Single article by slug (includes populated `reactions` count). |
| POST | `/api/articles/:slug/react` | Anonymous reader reaction toggle (`{ reaction: 'helpful'|'insightful'|'rigorous', delta: 1|-1 }`). Rate-limited by IP. |
| GET | `/api/articles/:slug/comments` | Approved reader comments for an article (`isApproved: true`). |
| GET | `/api/topics` | All topics. |
| GET | `/api/topics/:slug` | Topic + its articles. |
| GET | `/api/questions` | All questions (supports `?topic=&difficulty=`). |
| GET | `/api/paths` | All learning paths. |
| GET | `/api/paths/:slug` | Single path. |
| GET | `/api/resources` | All resources (supports `?category=`). |
| GET | `/api/search?q=` | Full-text search (articles + questions + topics). |
| POST | `/api/comments` | Submit reader comment (defaults `isApproved: false`, enters moderation queue). |
| POST | `/api/contact` | Submit contact message (persisted to DB + optional email dispatch). |
| POST | `/api/submissions` | Submit reader question/objection (`status: pending`). |
| GET | `/api/settings/public` | Author profile + faith statements (public read). |
| POST | `/api/auth/login` | Email/password admin sign-in. |
| POST | `/api/analytics/events` | Accept a validated anonymous page-view event; server automatically updates `Article.views` asynchronously when an article route is viewed, unifying view metrics. |

### Protected Routes (JWT Required)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/articles` | Create article. |
| PUT | `/api/articles/:id` | Update article. |
| DELETE | `/api/articles/:id` | Delete article. |
| POST | `/api/topics` | Create topic. |
| PUT | `/api/topics/:slug` | Update topic. |
| DELETE | `/api/topics/:slug` | Delete topic. |
| POST | `/api/questions` | Map/create new theological question or objection. |
| PUT | `/api/questions/:id` | Update mapped question. |
| DELETE | `/api/questions/:id` | Delete mapped question. |
| POST | `/api/paths` | Create path. |
| PUT | `/api/paths/:slug` | Update path. |
| DELETE | `/api/paths/:slug` | Delete path. |
| POST | `/api/resources` | Create resource. |
| PUT | `/api/resources/:id` | Update resource. |
| DELETE | `/api/resources/:id` | Delete resource. |
| GET | `/api/comments` | All comments (admin moderation view). |
| PATCH | `/api/comments/:id/approve` | Approve comment (`isApproved: true`). |
| DELETE | `/api/comments/:id` | Delete comment. |
| GET | `/api/contact` | All contact messages. |
| PATCH | `/api/contact/:id/read` | Toggle message read/unread status. |
| DELETE | `/api/contact/:id` | Delete contact message. |
| GET | `/api/submissions` | All question submissions. |
| PATCH | `/api/submissions/:id/status` | Update submission status (`pending` ↔ `reviewed`). |
| DELETE | `/api/submissions/:id` | Delete question submission. |
| PUT | `/api/settings/profile` | Update author profile. |
| PUT | `/api/settings/faith` | Update faith statements. |
| POST | `/api/upload` | Upload cover image to Cloudinary (`multipart/form-data`). |
| GET | `/api/analytics/summary?from=&to=` | Page views, visits, and estimated unique visitors for a date range. |
| GET | `/api/analytics/timeseries?from=&to=&interval=day` | Daily page views and visits for charts. |
| GET | `/api/analytics/pages?from=&to=&limit=10` | Most-viewed pages and articles. |
| GET | `/api/analytics/referrers?from=&to=&limit=10` | Top referring domains, including direct/unknown traffic. |

## Phase 5 — Database Seed

**Goal:** Preserve initial content in MongoDB and provision the first email/password admin safely.

### Content Seed

1. Copy all content from `frontend/src/data.ts` into `backend/src/seed/seed.js`.
2. Insert the initial articles, topics, questions, paths, resources, and comments, plus the `SiteSettings` singleton (`AuthorProfile` + `FaithStatement`). Target an empty database or use insert-if-missing operations with stable identifiers; do not overwrite existing editorial changes when rerun.
3. Never clear all collections. Content seeding must not delete admins, reset passwords, or clear analytics history. Do not seed fake analytics events into production.
4. Run from `backend/`:
   ```sh
   node src/seed/seed.js
   ```

### One-Time Admin Seed

1. Create `backend/src/seed/seedAdmin.js` separately from the content seed.
2. Read `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, and `INITIAL_ADMIN_NAME` from backend-only environment variables. Validate them and normalize the email; use a strong, unique website password.
3. If the admin email already exists, report that setup is complete without modifying its password, name, or active status.
4. Otherwise, hash the password with bcrypt and insert one active `Admin` record. Use the unique email index to prevent duplicate accounts, including concurrent setup attempts.
5. Run once from `backend/`:
   ```sh
   node src/seed/seedAdmin.js
   ```
6. Log in using the seeded email and password, then remove `INITIAL_ADMIN_PASSWORD` from the setup environment. The stored hash is sufficient for subsequent logins.

There is no public admin-registration endpoint. Provisioning another admin or resetting a forgotten password requires a separate, deliberate operator action through a trusted backend maintenance script; rerunning the seed is not a password-reset mechanism.

## Phase 6 — Frontend API Service Layer

**Goal:** Replace every `localStorage` read/write in `AppContext` with real API calls.

### Frontend Dependencies

Install `axios` in `frontend/package.json`:
```sh
npm install axios
```

### New Files to Create in `frontend/src/`

```text
src/
└── services/
    ├── api.ts          # Axios instance with baseURL + auth interceptor
    ├── articles.ts     # Article CRUD + reactions
    ├── topics.ts
    ├── questions.ts    # Questions CRUD (public list + admin mapping)
    ├── paths.ts
    ├── resources.ts
    ├── comments.ts     # Public article comments + admin moderation
    ├── contact.ts      # Contact message submission + admin moderation
    ├── submissions.ts  # Question submissions + review status
    ├── auth.ts         # Seeded admin email/password login
    ├── analytics.ts    # Public event submission and protected reports
    ├── search.ts
    ├── settings.ts
    └── upload.ts
```

### AppContext Migration Strategy

Do this incrementally, one model at a time:

```text
localStorage state       → useState + useEffect (fetch on mount)
addArticle()             → POST /api/articles → re-fetch or optimistic update
updateArticle()          → PUT /api/articles/:id
deleteArticle()          → DELETE /api/articles/:id
toggleReaction()         → POST /api/articles/:slug/react (optimistic local + API sync)
addQuestion()            → POST /api/questions
approveComment()         → PATCH /api/comments/:id/approve
deleteComment()          → DELETE /api/comments/:id
updateSubmissionStatus() → PATCH /api/submissions/:id/status
deleteContactMessage()   → DELETE /api/contact/:id
```

### Add to AppContext

- `isLoading: boolean` state per data category.
- `error: string | null` state.
- Keep a LocalStorage fallback layer only for `darkMode` and `progress` (reading progress — these stay local).

### Loading State Pattern to Add in Each Page

```tsx
if (isLoading) return <SkeletonLoader />;
if (error) return <ErrorState message={error} />;
```

## Phase 7 — Cover Image Upload

**Goal:** Replace the current URL text field in `ArticleEditor` with a real file upload.

### Backend (Production Cloud Storage)

- Use Multer with memory storage (`multer.memoryStorage()`) and stream directly to **Cloudinary** (`cloudinary.v2.uploader.upload_stream`).
- Do **not** rely on local `/uploads/` for production deployments on Render or Railway, as ephemeral server instances wipe locally written files upon restarts and redeploys. Local filesystem storage is strictly a development fallback.
- `POST /api/upload` returns `{ url: "https://res.cloudinary.com/..." }`.

### Frontend (`ArticleEditor.tsx`)

- Replace `<input type="text" placeholder="Cover image URL...">` with `<input type="file" accept="image/*">`.
- On file select → `POST /api/upload` → receive back the stored URL → set `editedArticle.coverImage`.

## Phase 8 — Search Implementation (Live Autocomplete + Full-Text)

**Goal:** Replace client-only filtering with high-performance search queries.

### Search Engine Strategy (Whole-Word vs Autocomplete)

1. **Navbar Live Dropdown (Prefix & Substring Autocomplete):**
   - MongoDB compound `$text` indexes perform **whole-word stemming** and do not match partial prefixes (e.g. typing `"phi"` returns 0 results for `"philosophy"`). Furthermore, MongoDB lacks native stemming for Amharic script.
   - For the live 300ms debounced search in [Navbar.tsx](file:///home/girma/Hokhma-Study/frontend/src/components/Navbar.tsx), use an optimized case-insensitive regex query (`$regex: q, $options: 'i'`) across `title`, `titleAm`, and `tags`, or cache published index metadata on the client.
2. **Dedicated Search Page (`SearchResults.tsx`):**
   - Use compound text indexes on the `Article` model for comprehensive full-article searches:
     ```js
     { title: 'text', excerpt: 'text', tags: 'text', titleAm: 'text' }
     ```
   - `GET /api/search?q=resurrection` runs across Articles, Questions, and Topics with unified payload:
     ```json
     { "articles": [], "questions": [], "topics": [] }
     ```
   - `SearchResults.tsx` calls this endpoint and applies any secondary difficulty filters.

## Phase 8A — Website Visit Statistics

**Goal:** Show website traffic in the admin panel without requiring reader accounts.

### Statistics to Display

| Dashboard Label | Definition |
| --- | --- |
| Page Views | Accepted page-view events in the selected period. |
| Visits | Distinct anonymous session IDs with an event in the selected period. A session expires after 30 minutes of inactivity. |
| Unique Visitors | Estimated distinct consenting browser IDs in the selected period, not a count of people. Show unavailable when visitor tracking is disabled. |
| Popular Pages | Pages ranked by page views. |
| Popular Articles | Published articles ranked by tracked article page views. |
| Traffic Sources | Referring domains or Direct / Unknown; not full referrer URLs. |
| Daily Traffic | Daily page views and visits using UTC reporting boundaries. |

Visits and unique visitors are distinct counts for each period, not sums of daily distinct counts. Ad blockers, consent choices, bots, shared devices, and cleared storage affect accuracy. Session-only mode estimates browser sessions without identifying returning visitors.

### Backend Collection and Reports

1. Create `AnalyticsEvent.js`, `analytics.routes.js`, and `analytics.controller.js` as listed above; mount the routes under `/api/analytics`.
2. `POST /api/analytics/events` accepts only known fields: a random `eventId`, `type: page_view`, canonical public route, random `sessionId`, optional consenting `visitorId`, and optional referrer hostname. Set `occurredAt` on the server and derive any `articleId` from a published article route.
3. Validate route formats, ID formats, hostname length, and small payload limits. Reject admin routes and unknown event types. Rate-limit ingestion; browser origin checks are defense in depth, not proof that an event is genuine.
4. Use a unique `eventId` to make retries idempotent. Exclude admin traffic in the frontend, filter obvious bots where feasible, and label the results as estimates rather than fraud-proof counts.
5. Use MongoDB aggregation for total events, distinct sessions/visitors, daily buckets, popular pages, and referrer hosts. Restrict all report endpoints to active admins.
6. Validate `from` and `to` as dates, use inclusive `from` and exclusive `to`, cap ranges at 90 days, restrict `interval` to supported values, and cap `limit`. Return zero-filled chart dates for empty days.
7. Delete raw events after 90 days through the TTL index. Reports cover retained events only; label partial data and do not promise lifetime totals. If longer reporting is later needed, design separate retained aggregates with a documented retention policy.
8. Do not silently equate `Article.views` with tracked events. Keep the existing counter separate and label its meaning, or explicitly migrate it so one accepted article page-view event updates it exactly once. Never increment both through the tracking endpoint and `/api/articles/:id/view` for the same visit.

### Frontend Tracking

1. Add a tracker near the application root and send a page-view event on initial public page load and each hash-route change. A hash-based application needs route-change tracking; tracking only the initial HTML request misses navigation.
2. Normalize the hash route to a stable page identifier and remove query strings, search terms, emails, and other potentially sensitive values. Do not send the complete browser URL or authentication tokens.
3. Generate random anonymous IDs with `crypto.randomUUID()`. Keep the session ID and last activity in `sessionStorage`, renewing after 30 minutes of inactivity. Keep an optional returning-visitor ID only after applicable consent.
4. Avoid duplicate events from React development effects or retries by reusing an event ID for the same navigation; a later genuine navigation gets a new ID.
5. Treat collection failures as non-blocking. Browsing must still work when analytics is unavailable.
6. Exclude admin routes and known signed-in admin browsing from collection. Stop collection when consent is withdrawn and remove optional visitor identifiers.

### Admin Statistics Page

- Add an admin-only **Statistics** navigation item and page.
- Use Title Case labels: **Page Views**, **Visits**, **Unique Visitors**, **Popular Articles**, and **Traffic Sources**.
- Provide **Today**, **Last 7 Days**, **Last 30 Days**, and **Custom Range** filters within the retained reporting window.
- Display summary cards, a daily traffic chart, popular-page and article tables, and traffic-source totals. Prefer an existing chart library; simple tables are acceptable initially.
- Fetch reports through `services/analytics.ts` with the same application JWT as other protected requests.
- Include loading, error, empty, and partial-data states; indicate UTC reporting and the 90-day retention window.

### Privacy and Validation

- Do not store raw IP addresses, admin identities, email addresses, full user-agent strings, or full referrer URLs in analytics events. Do not log sensitive event payloads.
- Document collection in the privacy notice and apply consent requirements for the deployment's jurisdiction. Anonymous IDs can still be personal data; do not describe this as automatically exempt from privacy laws.
- Test first-load and hash-route events, duplicate retries, session expiry, date boundaries, unauthorized reports, consent withdrawal, and admin-route exclusion.
- Verify a known set of test events produces the expected page views, distinct visits, chart totals, and rankings.
- This plan stores analytics in your own MongoDB database and does not send visit events to a third-party analytics provider. Adding an external provider later requires a separate privacy and configuration decision.

## Phase 9 — Security & Production Hardening

**Goal:** Safe to deploy.

| Task | Tool |
| --- | --- |
| Rate limiting on auth + contact + comment routes | `express-rate-limit` |
| Security headers | `helmet` |
| Input sanitization + validation | `express-validator` |
| Centralized error handler middleware | Custom `errorHandler.js` |
| CORS locked to frontend origin | `cors({ origin: process.env.CLIENT_ORIGIN })` |
| Remove hardcoded password from `AdminLogin.tsx` | Clear the `useState` defaults |
| Log structured errors | `morgan` + optional `winston`; redact tokens and sensitive URL values |
| Admin authentication and authorization | Bcrypt password verification, JWT validation, active-admin checks, and no public registration |
| Analytics abuse prevention and reporting privacy | Ingestion rate limits, validation, restricted reports, consent controls, and retention |

The original JWT storage plan uses `localStorage`, which exposes tokens to JavaScript and therefore to XSS. Prefer secure, HttpOnly cookies for production if you migrate login and protected calls together; add CSRF protection and explicit credentialed CORS. If keeping bearer tokens, use short lifetimes, strong XSS defenses, and never log them.

## Phase 10 — Deployment

**Goal:** Live on the internet.

| Piece | Platform |
| --- | --- |
| MongoDB | MongoDB Atlas (free M0 cluster) |
| Backend API | Railway or Render (Node.js service) |
| Frontend | Vercel (static Vite build) |

### Steps

1. Push `backend/` to its own repo or a monorepo subfolder.
2. Set environment variables on Railway/Render:
   - Server & Auth: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`
   - Image Cloud Storage: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Mail Service: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_RECEIVER_EMAIL`
3. Set `VITE_API_BASE_URL` in Vercel environment variables → points to the deployed backend URL.
4. Update frontend `api.ts` to use `import.meta.env.VITE_API_BASE_URL`.
5. Confirm CORS allows the Vercel domain.
6. Provision the first admin using `src/seed/seedAdmin.js` against the deployed database with securely supplied initial admin environment variables. Skip creation if that admin already exists and remove the initial password from the environment afterward.
7. Verify seeded admin login, rejected invalid credentials, disabled-admin access checks, and protected statistics access over HTTPS. Confirm secrets and password hashes are not exposed to the frontend or logs.
8. Ensure MongoDB analytics indexes are created, event retention is active, and the privacy notice and consent controls are ready before enabling tracking.

## Execution Order (Week-by-Week View)

**Hokhma Study Backend Wiring**

| Stage | Phases |
| --- | --- |
| Foundation | Phase 1 — Backend Setup; Phase 2 — Mongoose Models |
| API | Phase 3 — Authentication; Phase 4 — REST Endpoints; Phase 5 — Database Seed |
| Frontend | Phase 6 — Frontend API Service Layer; Phase 7 — Image Upload; Phase 8 — Backend Search; Phase 8A — Website Visit Statistics |
| Launch | Phase 9 — Security Hardening; Phase 10 — Deployment |

> The attached source’s timeline diagram is corrupted. The phase order is reproduced here; exact week assignments could not be recovered.

## What Stays Unchanged in the Frontend

These frontend features keep their existing design and behavior — the API replaces the data source. `AdminLogin` switches from fake login to the seeded email/password API, and statistics adds an admin page plus public route tracking; existing pages may still need loading/error states as described above:

- All page components (`Home`, `ArticleDetail`, `Topics`, etc.).
- All UI components (`Navbar`, `Footer`, `DifficultyBadge`).
- `LanguageContext` (stays purely frontend).
- Dark mode preference (stays in `localStorage`).
- Learning path reading progress (stays in `localStorage` — no user accounts needed).
- Hash-based router (`AppContext.parseHash`).
