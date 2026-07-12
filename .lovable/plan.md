## Plan: War Match Tracker

### Concept
Track whether FWA clans are correctly matched. The tracked clan list comes from `https://fwastats.com/Clans.json` (417 FWA clans). For each tracked clan we fetch its **live current-war opponent** from the Clash of Clans API and check whether that opponent is also in the FWA list:

- Opponent **in** FWA list → **Successful match**
- Opponent **not in** FWA list → **Mismatch**

Opponents are also cross-referenced against clan associations for Blacklisted and Association-based counts.

### Stats shown
```text
Total Clans            : all tracked FWA clans (417)
Clans In War           : clans currently in a war with an opponent
Total Successful Matches: opponent found in FWA list
Total Miss Matches     : opponent NOT in FWA list
Miss Match Percentage  : miss / (success + miss)
Blacklisted Matches    : opponent has a "Blacklist" association
Association Based Matches: opponent exists in clan_associations
```
A table lists every **NON-match** (tracked clan → opponent tag/name, war state, blacklist/association flags).

### 1. Database (migration)
- Add `war_tracker` value to the `app_role` enum (new access role).
- `war_match_scans` — one row per scan run: `total_clans`, `clans_in_war`, `successful_matches`, `mismatches`, `mismatch_percentage`, `blacklisted_matches`, `association_matches`, `status`, `run_by`.
- `war_match_results` — per clan/opponent: `scan_id`, `clan_tag`, `clan_name`, `opponent_tag`, `opponent_name`, `war_state`, `is_match`, `is_blacklisted`, `is_association`.
- GRANTs + RLS: authenticated with a staff/war_tracker role can read; service_role full access (edge function writes).
- Seed a **"Blacklist"** association type into `association_types` (via insert tool).

### 2. Edge function: `war-match-tracker`
- Fetches `Clans.json`, builds a Set of tracked tags.
- Loads `clan_associations` (tag → type) once; flags Blacklist vs any association.
- Iterates tracked clans in small concurrent batches, calling CoC `clans/{tag}/currentwar` (reusing the existing dynamic-key/retry logic from `coc-api`).
  - `notInWar` or private war log → skipped from match math (recorded as no-opponent).
  - `preparation` / `inWar` / `warEnded` → extract opponent tag + name.
- Computes stats, writes one `war_match_scans` row + `war_match_results` rows using the service-role client.
- Returns the scan summary.

### 3. Scheduled + manual runs
- Manual: "Run Scan" button on the page invokes the function.
- Scheduled: enable `pg_cron` + `pg_net` and schedule an hourly call to the function (via insert tool, since it contains project-specific URL/key).

### 4. Frontend: `src/pages/WarMatchTracker.tsx` (route `/war-tracker`)
- Access: `war_tracker`, `mod`, `admin`, `primary_admin` (others redirected to `/staff`).
- Summary stat cards (the metrics above) + last-scan timestamp.
- "Run Scan" button with progress/loading state; realtime refresh when a scan completes.
- Mismatch table with clan badge, opponent tag/name, war state, and Blacklist/Association badges. Filter/search by clan name.

### 5. Wiring
- `src/App.tsx` — add `/war-tracker` route.
- `src/components/Navbar.tsx` — add "War Tracker" link (role-gated).
- `src/pages/StaffDashboard.tsx` — include `war_tracker` in the role assignment options so admins can grant it.

### Files
- **Create**: `supabase/functions/war-match-tracker/index.ts`, `src/pages/WarMatchTracker.tsx`
- **Modify**: `src/App.tsx`, `src/components/Navbar.tsx`, `src/pages/StaffDashboard.tsx`
- **Migration**: enum value + 2 tables (GRANTs/RLS)
- **Data**: seed "Blacklist" association type; schedule cron job

### Notes / trade-offs
- 417 live war lookups are rate-limited; batching keeps it within limits but a full scan takes time and some clans with private war logs can't be read (reported as skipped).
- New role name proposed as `war_tracker` — tell me if you'd prefer a different name.
