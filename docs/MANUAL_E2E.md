# Manual E2E: Share test flow

Automated checks run without Supabase secrets: `npx tsc --noEmit` and `npm run build` both pass. Full flow below requires a configured `.env.local` (see `.env.local.example`).

## Prerequisites

1. Copy `.env.local.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` — use `http://localhost:3000` on desktop only; for phone QR scanning use your machine’s LAN IP (e.g. `http://192.168.1.42:3000`) or a deployed URL.
2. Supabase tables/policies for sessions and session results must be deployed.
3. Run `npm run dev` in the `tester` directory.
4. Use two browsers: normal window (owner) and incognito/private (participant).

## Routes verified in build

| Route | Purpose |
|-------|---------|
| `/share` | Create session, join link, teacher key, QR |
| `/share/[sessionId]` | Owner dashboard (teacher key gate, polling, import, end) |
| `/join/[sessionId]` | Participant welcome / start |
| `/join/[sessionId]/[attempt]` | Participant test attempt |
| `/join/[sessionId]/[attempt]/statistic` | Results + Share with owner |

Navigation: **Tests** (`/tests`) → outline **Share test** → `/share` (next to **Laboratory**).

---

## Test script

### 1. Owner: create session

1. Open `/tests` and click **Share test** (or go to `/share`).
2. Enter **Your name** (host display name).
3. Select a startable test card (ring highlight).
4. Click **Create session**.
5. **Expected:** Success screen with QR, join link, and **Teacher key**.
6. Click **Copy key** and confirm clipboard; note the join URL path (`/join/{sessionId}`).

### 2. Owner: open dashboard with key

1. Click **Open dashboard** (or open `/share/{sessionId}?key={teacherKey}`).
2. If prompted, paste the teacher key and unlock.
3. **Expected:** Dashboard shows test title, host name, **Active** badge, and **Student results** card.
4. **Expected:** Polling — empty state “No results yet…”; network tab shows repeated `listSessionResults` calls (~every 3s) while verified and session active.

### 3. Participant: join and complete test

1. In incognito, open the join link (`/join/{sessionId}`) from step 1.
2. **Expected:** Welcome page for the shared test; **Start** enabled for a valid test.
3. Start the test, answer or skip questions until finished.
4. **Expected:** Redirect to `/join/{sessionId}/{attemptId}/statistic` with score summary.
5. Click **Share with owner**.
6. **Expected:** Button shows sending then sent; no error.

### 4. Owner: see result and import

1. Return to the owner dashboard tab (keep it open or refresh).
2. **Expected:** Within a few poll intervals, a new row appears under **Student results** (score %, duration, timestamp).
3. Click **Import** on that row.
4. **Expected:** Row shows **Imported**; button disabled.
5. Optional: **Import all** when multiple pending rows exist.

### 5. Owner: end testing

1. Click **End testing** and confirm the dialog.
2. **Expected:** Status badge changes to **Ended**; banner notes session ended; **End testing** button hidden.

### 6. Participant: join again after end

1. In incognito, open the same join link or use **Return** from statistics to `/join/{sessionId}`.
2. **Expected:** Message **This test session has ended.** (no start).

### 7. QR / phone (optional)

1. Set `NEXT_PUBLIC_APP_URL` to your LAN IP or production URL; restart dev server.
2. Create a new session and scan QR from a phone on the same network.
3. **Expected:** Phone opens join URL and can complete steps 3–6.

---

## Automated verification log

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass |
| Routes in build output | `/share`, `/share/[sessionId]`, `/join/...` present |
| Share flow imports | App routes → feature components/pages resolve |

## Troubleshooting

- **Session create fails:** Check Supabase URL/key and RLS policies.
- **Share with owner fails:** Participant needs network; verify `session_results` insert policy.
- **Dashboard empty after share:** Confirm teacher key verified (polling only when `pollEnabled && verified`).
- **QR opens wrong host on phone:** `NEXT_PUBLIC_APP_URL` must not be `localhost` for mobile devices.
