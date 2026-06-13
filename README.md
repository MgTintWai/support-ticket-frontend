# Support Ticket Frontend

React SPA for the Support Ticket Portal. Provides role-aware dashboards, ticket management, SLA visibility, and threaded comments for client users and support agents.

**Companion API:** [support-ticket-api](https://github.com/your-org/support-ticket-api) (Laravel REST API)

**Stack:** React 19, Vite 8, Tailwind CSS v4, React Router 7, Axios, TanStack Query

---

## Project Overview

This frontend consumes the Support Ticket API and delivers:

- **Client users** — dashboard, ticket list with filters, create tickets, view details, post public comments, SLA badges.
- **Support agents** — all client features plus cross-organization visibility, ticket assignment, status/priority updates, and internal notes.

The UI prioritizes functionality and clarity over visual polish. Layout is professional, mobile-responsive, and role-aware without Redux or unnecessary state libraries.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router 7 |
| HTTP | Axios |
| Server state | TanStack Query v5 |
| Auth storage | `localStorage` (Bearer token) |

No Redux — server state is managed by TanStack Query; auth context holds the current user.

---

## Architecture Overview

```
Browser
  → React Router (protected routes)
  → AuthContext (GET /auth/me)
  → TanStack Query (cache + mutations)
  → Axios client (Bearer token interceptor)
  → Laravel API (/api/v1)
```

| Concern | Implementation |
|---------|----------------|
| **Routing** | Public `/login`; all other routes behind `ProtectedRoute` |
| **Auth** | Token in `localStorage`; Axios attaches `Authorization` header |
| **401 handling** | Axios interceptor clears token and redirects to `/login` |
| **Data fetching** | TanStack Query with 30s stale time |
| **Mutations** | Invalidate related query keys on success |
| **Role UI** | `useAuth()` exposes `isAgent` / `isClient` for conditional rendering |

---

## Folder Structure

```
src/
├── main.jsx                    # React root + global CSS
├── App.jsx                     # Router, QueryClient, AuthProvider
├── index.css                   # Tailwind v4 imports
├── context/
│   └── AuthContext.jsx         # Current user from /auth/me
├── api/
│   ├── axios.js                # Base client, interceptors
│   ├── auth.js
│   ├── tickets.js
│   ├── comments.js
│   ├── organizations.js
│   └── users.js
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx       # Stats + recent tickets
│   ├── TicketsPage.jsx         # Filterable list
│   ├── CreateTicketPage.jsx
│   └── TicketDetailPage.jsx    # Agent actions + comments
├── components/
│   ├── layout/AppLayout.jsx    # Nav, mobile hamburger
│   ├── common/ProtectedRoute.jsx
│   └── tickets/
│       ├── TicketListCard.jsx  # Mobile card layout
│       ├── TicketStatusBadge.jsx
│       └── SlaBadge.jsx
└── utils/
    ├── storage.js              # Token helpers
    ├── constants.js            # Status/priority labels
    └── ui.js                   # Shared Tailwind class strings
```

---

## Pages & Routes

| Route | Page | Access | Features |
|-------|------|--------|----------|
| `/login` | LoginPage | Public | Email/password login |
| `/` | DashboardPage | Authenticated | Open/due-soon/overdue stats, recent tickets |
| `/tickets` | TicketsPage | Authenticated | Search, status/priority/SLA/org filters, paginated list |
| `/tickets/new` | CreateTicketPage | Authenticated | Create ticket (org picker for agents) |
| `/tickets/:id` | TicketDetailPage | Authenticated | Details, comments, agent actions |

### Role-based UI

| Feature | Client | Agent |
|---------|--------|-------|
| Dashboard | Own org tickets | All organizations |
| Ticket filters | Status, priority, SLA, search | + organization filter |
| Create ticket | Auto-scoped to own org | Organization selector |
| Update priority/status | No | Yes |
| Assign agent | No | Yes |
| Internal note checkbox | No | Yes |
| Internal notes in list | Hidden (API filtered) | Shown with amber styling |

---

## API Integration

Base URL is configured via environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Endpoints consumed

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Tickets | `GET/POST /tickets`, `GET/PUT /tickets/{id}`, `PATCH .../status`, `PATCH .../assign` |
| Comments | `GET/POST /tickets/{id}/comments` |
| Organizations | `GET /organizations` (agent org picker, client own org) |
| Users | `GET /users/agents` (assignment dropdown) |

### Response envelope

All API responses follow `{ success, message, data, meta? }`. API modules unwrap `data` for components.

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- Running instance of [support-ticket-api](https://github.com/your-org/support-ticket-api)

### Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

SPA available at `http://localhost:5173`.

### Demo accounts

Use the API seeded accounts:

| Role | Email | Password |
|------|-------|----------|
| Support Agent | `agent@support.local` | `password` |
| Client (Acme) | `client@acme.local` | `password` |
| Client (Globex) | `client@globex.local` | `password` |

---

## Build for Production

```bash
npm run build
npm run preview   # optional local preview of dist/
```

Set `VITE_API_BASE_URL` to your production API base (e.g. `https://api.example.com/api/v1`) before building.

---

## Responsive Design

- **Mobile:** Hamburger navigation, card-based ticket lists (`TicketListCard`)
- **Desktop (`md+`):** Full nav bar, table-based ticket lists
- Shared Tailwind utility classes in `src/utils/ui.js` for consistent spacing and components

---

## Assumptions

- API is the single source of truth for authorization; the UI reflects API capabilities but does not re-implement policy logic.
- Token-based auth only (no cookie/session SPA mode).
- Organization CRUD and ticket delete are API-only — not exposed in the UI (use Postman for those operations).
- Clients cannot edit ticket subject/description from the UI after creation (API supports update for open tickets).
- No real-time updates; data refreshes via TanStack Query invalidation and 30s stale time.

---

## Trade-offs

| Decision | Rationale |
|----------|-----------|
| TanStack Query over Redux | Server state is the primary concern; simpler mental model |
| `localStorage` for token | Straightforward SPA auth against Sanctum Bearer tokens |
| Shared `ui.js` class strings | DRY Tailwind patterns without a component library |
| Card layout on mobile | Better readability than cramped tables on small screens |
| Agent-only advanced actions | Keeps client UI simple; matches policy boundaries |

---

## Time Spent

Approximately 2 hours for pages, API integration, responsive layout, and documentation.

---

## Known Limitations

- No organization management screens (API supports full CRUD).
- No ticket delete button in UI (API supports soft delete for agents).
- No client-side ticket edit form (API supports update).
- No automated frontend tests.
- No i18n or accessibility audit beyond semantic HTML basics.

---

## Next Steps

- Add organization admin page for agents.
- Ticket delete with confirmation modal (agent only).
- Client ticket edit for open tickets.
- Frontend tests (Vitest + React Testing Library).
- Toast notifications for mutation errors.
- WebSocket/SSE for live ticket updates.

---

## Production Improvements

- Environment-specific `.env` files per deployment stage.
- CDN for static assets.
- Error boundary and global error toast.
- Lighthouse/accessibility pass.
- CI pipeline (`npm run build`, lint, tests).
- Strict Content Security Policy headers from hosting layer.

---

## Assessment Compliance

This frontend satisfies the assessment brief's UI requirements:

| Requirement | Status |
|-------------|--------|
| React | ✅ React 19 |
| React Router | ✅ |
| Axios | ✅ |
| TanStack Query | ✅ |
| No Redux | ✅ |
| Clean, functional UI | ✅ |
| Professional layout | ✅ Tailwind v4 |
| Login + ticket workflows | ✅ |
| Role-aware behavior | ✅ Client vs agent UI |

**API features not yet in UI** (available via API/Postman):

- Organization create/update/delete
- Ticket delete
- Client ticket update (subject/description)

These are acceptable for an assessment focused on demonstrating architecture and core workflows; document them as known limitations when submitting.
