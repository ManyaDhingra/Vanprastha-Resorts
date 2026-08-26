# HANDOFF — Resume-Now State (living document)

**Purpose:** disk-backed session state so conversations stay short. Read this at session
start; refresh it before ending any turn (or before compaction); never re-derive facts
from old chat history. Last updated: 2026-08-21.

**How to use:** (1) session start → read this file. (2) Work. (3) At turn end / >65%
context → update this file with deltas, keep it tight, end turn. Compaction summaries
carry only the delta since this file.

---

## 1. Live environment (this machine, Vanprastha-Resorts)

| Item | Value |
|---|---|
| Server | PRODUCTION standalone (`node .next/standalone/server.js`) on `http://localhost:3000` — NEVER dev (dev OOMs with user's sde-lab procs) |
| Latest log | `C:\Users\ItzP\AppData\Local\Temp\opencode\prod-noevents.log` (PID 12964) |
| Restart cmd | `$p=Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if($p){Stop-Process -Id $p.OwningProcess -Force}; Start-Sleep 1; Start-Process cmd -ArgumentList '/c','node .next/standalone/server.js > <log> 2>&1' -WorkingDirectory C:\Users\ItzP\Vanprastha-Resorts -WindowStyle Hidden; Start-Sleep 5` — after builds also copy `public → .next/standalone/public` and `.next/static → .next/standalone/.next/static` |
| `.env` has | DATABASE_URL, JWT_SECRET, admin creds (rotated — value in `.env` only), `RAZORPAY_WEBHOOK_SECRET` = generated (set), `RAZORPAY_KEY_ID/SECRET/NEXT_PUBLIC_*` = **EMPTY** (blocker) |
| Git | branch `feat/design-system-p0-ux` pushed to fork `iAMv1/Vanprastha-Resorts`; **PR #1 open** against `ManyaDhingra/main` (owner has not merged). Local `main` ahead of origin by 7 (unpushed — READ-only access). iAMv1 = READ on upstream, hence fork route |
| Tests | vitest 84 · tsc clean · eslint clean · prod build green (29 routes) · e2e `scripts/verify-api.ps1` 22/22 |
| Design state | P0 tokens DONE + committed (`e3e6e45`): pine #1E3A2D / brass #A87A3B / ivory #F7F4EE, Poppins dropped, logo/favicon recolored, WebP heroes, metadata, confirmation page, auth ?next= preservation, footer flex shell. Hero kept CENTERED per user preference (left-editorial attempt reverted). Events/Leaderboard sandbox leak purged (`29ea4fb`) |
| Admin login | `/login` with creds from `.env` (ADMIN_EMAIL / ADMIN_PASSWORD) |

## 2. Payment simulation (OUTSIDE the repo by user request)

- Folder: `C:\Users\ItzP\vanprastha-payment-sim\` — `webhook-simulate.ps1` + `dbq.mjs` (SQL via the app's own Prisma client; path anchored via `SIM_REPO` env; `--env-file` loads repo `.env`; SQL passed via temp file).
- Run: `cd C:\Users\ItzP\vanprastha-payment-sim; powershell -ExecutionPolicy Bypass -File webhook-simulate.ps1`.
- Sim users (DB-seeded once, bcrypt): `sima_a@test.local` (tests c1/c4), `simb_b@test.local` (c2/c3); password `SimPassw0rd!2026`. Register API is rate-limited 5/h/IP — never register from the sim; seed via `dbq.mjs SEEDUSERS`.
- Last known result: **15/17 PASS** (T1–T5, T7–T9 green; T6 got 503 = CORRECT no-keys behavior). T6 rewritten conditional: no keys → expect loud 503 + zero state change; keys → expect 200 + REFUNDED.
- **Rerun status as of 03:00 (2026-08-19): T6-fixed rerun STILL IN PROGRESS** — PID 13748, launched 02:53, likely in the 10-min quota wait (max runtime ~13 min). Result arrives as a session completion notification — read it before trusting sim status. If it never arrives, just rerun (idempotent, wipes own >1-min-old residue).
- Rate limiter traps for the sim: bookings 20/10min per user (script waits out window), login 30/15min IP + 10/15min per account (script backoffs 60s). Quota counters are in-memory — wiping rows does NOT reset them; only time does.
- Real keys arrive → fill `.env` → rerun sim (T6 refund path live) → then run the real payment e2e with test card `4111 1111 1111 1111`, and wire the webhook in the Razorpay dashboard (needs public HTTPS URL — zrok; ngrok.io/loca.lt etc. blacklisted; localhost rejected).

## 3. Design elevation (user-requested; skill: agency-design-pipeline)

- Full audit + art direction + roadmap: `docs/DESIGN-AUDIT-2026-08-19.md`. Direction = pine/brass/ivory palette, Cormorant light editorial, kill `#F97316` orange + navy `#234E70`, drop Poppins.
- **DONE & committed (`e3e6e45` + `29ea4fb`, in PR #1)**: P0 tokens, P3 confirmation page + auth `?next=` preservation, impeccable craft pass (kickers removed, de-carded WhyChoose, heading scale), token drift cleanup, SEO metadata, brass contrast fix, PNG→WebP, footer flex shell + pt-28 offsets, Events leak purge.
- **User preference override**: hero stays CENTERED with floating rounded-[32px] booking card — left-editorial P1 attempt was reverted by user. Do NOT re-attempt without explicit ask.
- Remaining OPTIONAL phases (not committed to): P2 rooms editorial bento, hero parallax motion. Only on user request.
- Every phase: build → Edge screenshot → vision-verify → then `npm run build` + standalone restart + copy public/static into standalone + `verify-api.ps1` 22/22.

## 4. Blockers (in order)

1. **PR #1 review/merge** (owner ManyaDhingra) — https://github.com/ManyaDhingra/Vanprastha-Resorts/pull/1. After merge: delete fork `iAMv1/Vanprastha-Resorts`, fast-forward local main.
2. **Razorpay sandbox keys** (user action; dashboard, free, no website needed for test keys) → fill `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` = same key id) → payment e2e + sim T6 live.
3. **Deploy** after merge+keys: checklist in `docs/STATUS.md` ("What is left"): standalone `node .next/standalone/server.js` (+ copy public & static into standalone), migrate deploy, seed (no admin rotate), HTTPS proxy, post-deploy smoke.

## 5. Windows script quirks (hard-won; apply to ANY new script)

- Native-arg quoting eats embedded `"` → SQL with quoted identifiers via **temp file**, never argv.
- PS 5.1 `Set-Content -Encoding UTF8` writes a **BOM** → use `-Encoding ascii`.
- Non-ASCII in .ps1 (em-dash) → byte 0x94 decodes as smart-quote `”` under ANSI → **parser blowup**. ASCII-only scripts.
- ESM bare imports resolve from the module's own dir → `createRequire` anchored at the repo package.json; top-level await OK in .mjs.
- Edge headless screenshots: `msedge.exe --headless --disable-gpu --user-data-dir=... --screenshot=OUT.png --window-size=1280,800 --virtual-time-budget=10000 URL`; ALWAYS vision-verify (dead URL renders a 28KB error PNG — size is not a signal).

## 6. Other live pointers

- Keys/values never duplicated in this file — they live in `.env` (gitignored). `.env.example` is the tracked template.
- Acceptable debt (unchanged): CSP `'unsafe-inline'` (Next flight scripts), in-memory single-process rate limits, 7d JWT window, localStorage bearer (CSP-mitigated).
- Free-image chain + design gates: AGENTS.md playbook (pollinations > horde > HF; no-key limits measured).
- CI runs full quality gate on push; local sequence = lint → tsc → vitest → build → verify-api.ps1.