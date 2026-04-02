

## Plan: League War Sync Pages

### Concept
Users tap on a league name (FWA, GFL, FWL, BZLM) to see upcoming war spin times for that league, converted to their local timezone. Admins manage these schedules.

### 1. Database: `league_schedules` Table

```sql
CREATE TABLE league_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_name text NOT NULL,  -- 'FWA', 'GFL', 'FWL', 'BZLM'
  spin_time timestamptz NOT NULL,
  notes text,
  status text DEFAULT 'scheduled',  -- scheduled, completed, cancelled
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

RLS: Public SELECT, staff INSERT/UPDATE, admin DELETE.
Enable realtime for live updates.

### 2. Sync Page (`/sync`) — Logged-in Users

- Four clickable league tabs/buttons: **FWA | GFL | FWL | BZLM**
- Tap a league → shows upcoming spin times for that league
- Times auto-converted to user's local timezone via `Intl.DateTimeFormat`
- Countdown timer to next spin
- Status badges (scheduled/completed/cancelled)
- Requires authentication

### 3. Sync Update Page (`/sync-update`) — Admin Only

- Add/edit/delete spin times per league
- Datetime picker for spin time (stored as UTC)
- Select league from dropdown (FWA/GFL/FWL/BZLM)
- Bulk status updates (mark completed/cancelled)
- View all schedules with filters by league

### 4. Navigation & Routing

- Add `/sync` route (auth-protected) in `App.tsx`
- Add `/sync-update` route (admin-protected) in `App.tsx`
- Add "War Sync" link in Navbar (visible to all, redirects to login if not authenticated)
- Add "Sync Update" tab in Staff Dashboard

### Files to Create/Modify
- **Create**: `src/pages/WarSync.tsx` — league selector + spin times display
- **Create**: `src/pages/SyncUpdate.tsx` — admin CRUD for schedules
- **Modify**: `src/App.tsx` — add routes
- **Modify**: `src/components/Navbar.tsx` — add Sync nav link
- **Modify**: `src/pages/StaffDashboard.tsx` — add Sync Update tab/link
- **Migration**: Create `league_schedules` table with RLS

