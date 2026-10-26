# TEST RESULTS — samity-tracker-bd (run #146, 2026-10-26 15:00 slot)

## Unit tests — 50/50 passed (`node tests/tests.js`, 0 repairs)
- Rotation: Oct 2026 -> m1, Dec -> m3, Jan 2027 -> m1 cycle 2; before-start -> null;
  5-month schedule month/member exact; year rollover 2026-12 + 1 = 2027-01.
- Money: parse "5000" -> 500000 paisa; "5000.50" -> 500050; "5,000" -> 500000;
  Bangla "৫০০০" -> 500000; bad/negative/3-decimal/zero rejected (null).
  Format 500000 -> "5,000.00"; Bengali digits -> "৫,০০০.০০"; negative -> "-1,500.00".
- Scenario (3 members x 5000 x 3 months): m1 paid 3/3, m2 2/3, m3 0/3.
  Dashboard: pot 15,000.00, expected 45,000.00, collected 25,000.00,
  paid out 15,000.00, outstanding 20,000.00, collection rate 55.56%.
- Import validation: good file ok; bad version, unknown-member payment,
  non-true payment, 1-member group, duplicate member id, bad month,
  zero payout amount, null, bad start month all rejected.
- Empty group: expected 0, rate 0.

## Headless-Chrome smoke — 21/21 passed, 0 console/page errors
(raw CDP, /opt/meta-chromium/chrome, file:// + ?asof=2026-10-26)
- Setup visible / app hidden at first load; create Para Samity (5000/mo,
  from 2026-10, Rahim/Karim/Sumon) -> app visible, pot "15,000.00", 3 rows.
- Rotation tab: first receiver Rahim, >= 6 rows.
- Contributions: toggle Rahim Oct -> paid-yes; member paid total "5,000.00";
  dashboard collected "5,000.00".
- Duplicate member "Rahim" -> inline error, still 3 members.
- Add month grows contribution columns by 1.
- BN toggle -> pot renders Bengali digits; reload -> group + language persist.
- 390px mobile: document scrollWidth <= 390 (no horizontal overflow).

## App fixes during the run (before tests)
- Load path: import validation requires 2+ members, but a group reduced to
  1 member by removal must reload intact -> lenient load check (members >= 1).
- Erase path: group:null stub now loads as "no group yet" with language kept.

## Source hygiene
- All sources pure ASCII (Bengali rendered via \uXXXX escapes in JS);
  `grep -P '[^\x00-\x7F]'` over index.html, css/, js/, tests/ returns nothing.
- Zero network requests by design (no CDN, no fonts, no analytics).
