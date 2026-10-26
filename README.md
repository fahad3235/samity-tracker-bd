# Samity Tracker BD

Offline, bilingual (English / বাংলা) tracker for a Bangladeshi rotating savings
group (*samity*): members pay a fixed monthly contribution, and one member
receives the whole pot each month, in rotation order.

## Problem

Samity records usually live in a paper notebook: who paid which month, whose
turn it is to receive the pot, and who still owes. This app digitizes that
notebook with exact math — no accounts, no server, no network calls. All data
stays in the browser's localStorage.

## Features

1. **Samity setup** — group name, monthly contribution per member, start month,
   and a member list (2+ members, duplicate names rejected inline).
2. **Dashboard** — monthly pot, collected so far, outstanding, collection
   rate, this month's recipient, and the next payout.
3. **Members** — per-member paid / total due / outstanding, add member, and
   safe removal (a member with payments or payouts cannot be removed).
4. **Contributions grid** — members × months; tap a cell to mark a month
   paid or unpaid. Add months one at a time.
5. **Rotation schedule** — the next two full cycles: who receives the pot
   each month, with a mark-paid toggle per payout.
6. **Data** — JSON export, strict JSON import (malformed files rejected with
   data intact), and typed-`DELETE` erase-all.
7. **Bilingual UI** — English / বাংলা toggle, persisted, with Bengali digits
   in Bengali mode. Fully responsive down to 390 px.

## How the rotation works

Members receive the pot in the order they were listed: the first member in
the start month, the second member the next month, and so on. After every
member has received once, the cycle repeats. Adding a member later changes
future rotation positions (the order is always the current list order) — the
app recomputes the schedule from the current list, and the Rotation tab shows
exactly what it computed.

## Money

All amounts are stored as integer paisa (BDT × 100) to avoid floating-point
error. Example: 3 members × ৳5,000/month = ৳15,000.00 pot; if Rahim paid all
3 recorded months, his paid total is ৳15,000.00.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no dependencies, no
network requests. `js/logic.js` holds the pure, testable logic;
`js/app.js` holds DOM wiring, persistence, and translations.

## Install / run

No install needed. Open `index.html` in any modern browser, or serve the
folder:

```sh
npx serve .
# or
python3 -m http.server 8080
```

## Testing

```sh
node tests/tests.js          # 50 unit tests (rotation, money, import validation)
node tests/smoke.js /opt/meta-chromium/chrome 9231   # 21 headless-Chrome checks
```

Deterministic date: append `?asof=YYYY-MM-DD` to override "today" (used by
the smoke test so "this month's recipient" is stable).

## Deployment

Static site — any static host works, including GitHub Pages (main branch,
root). Live site: https://fahad3235.github.io/samity-tracker-bd/

## Limitations

- This is a personal record-keeping tool. It does not move money, message
  members, or verify that a payment actually happened — verify payouts with
  your group before relying on them.
- Rotation is recomputed from the current member list; if your samity's real
  rotation was fixed before a member joined or left, record any difference in
  the payout toggles and check the schedule against your notebook.
- Data lives only in this browser's localStorage: export regularly as a
  backup before clearing browser data or switching devices.

## Status

Working MVP. Tests: 50/50 unit + 21/21 headless-Chrome smoke, 0 console or
page errors.
