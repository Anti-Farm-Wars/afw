# Hunter Lists + Public Data API

Automatically classify the clans that keep bumping into FWA clans into three living lists, and expose them over a key-protected API.

## The three lists

| List | Rule |
| --- | --- |
| Hunting Clans | 10 or more separate war encounters against FWA clans, all time |
| Live Hunters | Hunting Clan, seen within the last 14 days, and consistent war size |
| Retired Hunters | Hunting Clan with nothing seen for 30+ days |

Clans between 14 and 30 days quiet stay as Hunting Clans only — they are neither live nor retired yet.

## How encounters are counted

Scans run hourly, so the same war appears in many scans. One "encounter" = one FWA clan vs one opponent clan on one day. Using that rule on the history already stored: about 105 clans reach 10+ encounters, 225 have been seen in the last 14 days, and 515 have been quiet 30+ days.

## War size / composition

War size is not currently recorded. The tracker will start saving the team size of each war (15v15, 30v30, ...). "Consistent composition" means at least 3 recorded encounters and the clan's most common war size covering 70%+ of them. Clans with no recorded size yet are treated as consistent so the Live list is not empty on day one; the check tightens automatically as new data arrives.

## What you will see

A new "Hunters" section on the War Tracker page with three tabs (Hunting / Live / Retired). Each row shows clan name and tag, total encounters, first and last seen, usual war size, the FWA clans it hits most, and any association/blacklist tag it already carries, plus the existing Associate button. Search and sort by encounter count; CSV export.

## The API

A public endpoint returning the same lists as JSON, protected by an API key you send in a header. Example shapes:

```text
GET /hunters            -> all three lists
GET /hunters?list=live  -> one list (hunting | live | retired)
```

Each clan entry: tag, name, encounters, first_seen, last_seen, days_since_last, usual war size, size consistency, association type, blacklisted flag. Response is cached briefly so repeated calls are cheap.

## Technical details

- Migration: add `team_size int` to `war_match_results`; create view/function `hunter_stats` computing per-opponent encounter counts (distinct clan_tag + day), first/last seen, modal team size and its share, plus a `get_hunter_lists()` security-definer function returning classified rows. Thresholds stored in a small `hunter_settings` table so they can be tuned without a code change.
- Edge function `war-match-tracker`: record `war.teamSize` on each result row.
- New edge function `hunters-api`: `verify_jwt = false`, validates `x-api-key` against a generated `HUNTERS_API_KEY` secret, calls `get_hunter_lists()` with the service role, returns JSON with CORS headers; validates the `list` query param.
- Frontend: new `src/components/war-tracker/HunterLists.tsx` rendered on `WarMatchTracker.tsx`, reading via the existing authenticated client and reusing the current association dialog.
- Access for logged-in users stays gated by `can_view_war_tracker`.
