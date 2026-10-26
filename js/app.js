// Samity Tracker BD \u2014 UI wiring, persistence, i18n. Uses window.SamityLogic.
(function () {
  'use strict';
  var L = window.SamityLogic;
  var KEY = 'samity-tracker-bd-v1';

  var STR = {
    en: {
      sub: 'Rotating savings group tracker \u2014 members, monthly contributions, payout rotation.',
      setupTitle: 'Start your samity',
      setupHint: 'Add at least 2 members. The payout order follows the order you list members in: the first member receives the pot in the start month, the next member the month after, and so on.',
      groupName: 'Samity name',
      contribution: 'Monthly contribution per member (BDT)',
      startMonth: 'Start month',
      members: 'Members (one name per line)',
      create: 'Create samity',
      errGroup: 'Enter a samity name.',
      errAmount: 'Enter a valid monthly contribution (whole taka or up to 2 decimals).',
      errStart: 'Pick a valid start month.',
      errMembers: 'Add at least 2 member names.',
      errDup: 'Member names must be unique.',
      meta: '{n} members \xb7 {amt} per month \xb7 started {m}',
      newGroup: 'New samity',
      pot: 'Monthly pot',
      collected: 'Collected so far',
      outstanding: 'Outstanding',
      rate: 'Collection rate',
      recipient: "This month's recipient",
      next: 'Next payout',
      tabs: ['Members', 'Contributions', 'Rotation', 'Data'],
      addMember: 'Add member',
      memberNamePh: 'Member name',
      thMember: 'Member', thPaid: 'Paid', thDue: 'Total due', thOut: 'Outstanding',
      remove: 'Remove',
      memberNote: 'A member who already has payments or payouts cannot be removed.',
      errMemberName: 'Enter a member name.',
      errMemberDup: 'That name is already in the group.',
      errMemberRemove: 'Cannot remove a member with payments or payouts.',
      addMonth: 'Add next month',
      contribHint: 'Tap a cell to mark that month paid or unpaid.',
      contribEmpty: 'No months yet. Add the first month above.',
      rotationHint: 'One member receives the full pot each month, in list order. Mark a payout paid once it is handed over.',
      thMonth: 'Month', thReceiver: 'Receiver', thCycle: 'Cycle', thPayout: 'Payout', markPaid: 'Mark paid', markUnpaid: 'Mark unpaid', paid: 'Paid', unpaid: 'Not paid',
      export: 'Export JSON',
      import: 'Import JSON',
      dataOk: 'Import successful.',
      dataBad: 'Import failed: file is not a valid samity export.',
      eraseHint: 'Erase everything: type DELETE in the box, then press Erase.',
      erase: 'Erase all',
      foot: 'Personal tracker for your own samity records. Amounts are what you enter \u2014 this app does not move money, contact members, or verify payments. Verify payouts with your group before relying on them.',
      none: '\u2014',
      confirmNew: 'Start a new samity? The current group and all its records will be replaced.'
    },
    bn: {
      sub: '\u0998\u09c2\u09b0\u09cd\u09a3\u09be\u09af\u09bc\u09ae\u09be\u09a8 \u09b8\u099e\u09cd\u099a\u09af\u09bc \u0997\u09cd\u09b0\u09c1\u09aa \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0 \u2014 \u09b8\u09a6\u09b8\u09cd\u09af, \u09ae\u09be\u09b8\u09bf\u0995 \u099a\u09be\u0981\u09a6\u09be, \u09aa\u09be\u0993\u09a8\u09be-\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09c7\u09b0 \u09aa\u09b0\u09cd\u09af\u09be\u09af\u09bc\u0964',
      setupTitle: '\u0986\u09aa\u09a8\u09be\u09b0 \u09b8\u09ae\u09bf\u09a4\u09bf \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8',
      setupHint: '\u0995\u09ae\u09aa\u0995\u09cd\u09b7\u09c7 \u09e8 \u099c\u09a8 \u09b8\u09a6\u09b8\u09cd\u09af \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964 \u0986\u09aa\u09a8\u09bf \u09af\u09c7 \u0995\u09cd\u09b0\u09ae\u09c7 \u09b8\u09a6\u09b8\u09cd\u09af\u09a6\u09c7\u09b0 \u09a8\u09be\u09ae \u09b2\u09bf\u0996\u09ac\u09c7\u09a8, \u09b8\u09c7\u0987 \u0995\u09cd\u09b0\u09ae\u09c7\u0987 \u09aa\u09be\u0993\u09a8\u09be \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09ac\u09c7: \u09aa\u09cd\u09b0\u09a5\u09ae \u09b8\u09a6\u09b8\u09cd\u09af \u09b6\u09c1\u09b0\u09c1\u09b0 \u09ae\u09be\u09b8\u09c7 \u09aa\u09c1\u09b0\u09cb \u09aa\u099f \u09aa\u09be\u09ac\u09c7\u09a8, \u09aa\u09b0\u09c7\u09b0 \u09ae\u09be\u09b8\u09c7 \u09aa\u09b0\u09c7\u09b0 \u09b8\u09a6\u09b8\u09cd\u09af, \u098f\u09ad\u09be\u09ac\u09c7 \u099a\u09b2\u09ac\u09c7\u0964',
      groupName: '\u09b8\u09ae\u09bf\u09a4\u09bf\u09b0 \u09a8\u09be\u09ae',
      contribution: '\u09aa\u09cd\u09b0\u09a4\u09bf \u09b8\u09a6\u09b8\u09cd\u09af\u09c7\u09b0 \u09ae\u09be\u09b8\u09bf\u0995 \u099a\u09be\u0981\u09a6\u09be (\u099f\u09be\u0995\u09be)',
      startMonth: '\u09b6\u09c1\u09b0\u09c1\u09b0 \u09ae\u09be\u09b8',
      members: '\u09b8\u09a6\u09b8\u09cd\u09af\u0997\u09a3 (\u09aa\u09cd\u09b0\u09a4\u09bf \u09b2\u09be\u0987\u09a8\u09c7 \u098f\u0995\u099c\u09a8)',
      create: '\u09b8\u09ae\u09bf\u09a4\u09bf \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8',
      errGroup: '\u09b8\u09ae\u09bf\u09a4\u09bf\u09b0 \u09a8\u09be\u09ae \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      errAmount: '\u09b8\u09a0\u09bf\u0995 \u09ae\u09be\u09b8\u09bf\u0995 \u099a\u09be\u0981\u09a6\u09be \u09b2\u09bf\u0996\u09c1\u09a8 (\u09aa\u09c2\u09b0\u09cd\u09a3 \u099f\u09be\u0995\u09be \u09ac\u09be \u09a6\u09b6\u09ae\u09bf\u0995\u09c7\u09b0 \u09aa\u09b0 \u09e8 \u0998\u09b0 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4)\u0964',
      errStart: '\u09b8\u09a0\u09bf\u0995 \u09b6\u09c1\u09b0\u09c1\u09b0 \u09ae\u09be\u09b8 \u09ac\u09be\u099b\u09c1\u09a8\u0964',
      errMembers: '\u0995\u09ae\u09aa\u0995\u09cd\u09b7\u09c7 \u09e8 \u099c\u09a8 \u09b8\u09a6\u09b8\u09cd\u09af\u09c7\u09b0 \u09a8\u09be\u09ae \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
      errDup: '\u09b8\u09a6\u09b8\u09cd\u09af\u09a6\u09c7\u09b0 \u09a8\u09be\u09ae \u0986\u09b2\u09be\u09a6\u09be \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      meta: '{n} \u099c\u09a8 \u09b8\u09a6\u09b8\u09cd\u09af \xb7 \u09ae\u09be\u09b8\u09c7 {amt} \xb7 \u09b6\u09c1\u09b0\u09c1 {m}',
      newGroup: '\u09a8\u09a4\u09c1\u09a8 \u09b8\u09ae\u09bf\u09a4\u09bf',
      pot: '\u09ae\u09be\u09b8\u09bf\u0995 \u09aa\u099f',
      collected: '\u098f \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u0986\u09a6\u09be\u09af\u09bc',
      outstanding: '\u09ac\u0995\u09c7\u09af\u09bc\u09be',
      rate: '\u0986\u09a6\u09be\u09af\u09bc\u09c7\u09b0 \u09b9\u09be\u09b0',
      recipient: '\u098f\u0987 \u09ae\u09be\u09b8\u09c7\u09b0 \u09aa\u09cd\u09b0\u09be\u09aa\u0995',
      next: '\u09aa\u09b0\u09ac\u09b0\u09cd\u09a4\u09c0 \u09aa\u09be\u0993\u09a8\u09be',
      tabs: ['\u09b8\u09a6\u09b8\u09cd\u09af', '\u099a\u09be\u0981\u09a6\u09be', '\u09aa\u09b0\u09cd\u09af\u09be\u09af\u09bc', '\u09a1\u09c7\u099f\u09be'],
      addMember: '\u09b8\u09a6\u09b8\u09cd\u09af \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      memberNamePh: '\u09b8\u09a6\u09b8\u09cd\u09af\u09c7\u09b0 \u09a8\u09be\u09ae',
      thMember: '\u09b8\u09a6\u09b8\u09cd\u09af', thPaid: '\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4', thDue: '\u09ae\u09cb\u099f \u09a6\u09c7\u09af\u09bc', thOut: '\u09ac\u0995\u09c7\u09af\u09bc\u09be',
      remove: '\u09b8\u09b0\u09be\u09a8',
      memberNote: '\u09af\u09c7 \u09b8\u09a6\u09b8\u09cd\u09af\u09c7\u09b0 \u099a\u09be\u0981\u09a6\u09be \u09ac\u09be \u09aa\u09be\u0993\u09a8\u09be\u09b0 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u0986\u099b\u09c7, \u09a4\u09be\u0995\u09c7 \u09b8\u09b0\u09be\u09a8\u09cb \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964',
      errMemberName: '\u09b8\u09a6\u09b8\u09cd\u09af\u09c7\u09b0 \u09a8\u09be\u09ae \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      errMemberDup: '\u098f\u0987 \u09a8\u09be\u09ae\u099f\u09bf \u0987\u09a4\u09bf\u09ae\u09a7\u09cd\u09af\u09c7 \u0997\u09cd\u09b0\u09c1\u09aa\u09c7 \u0986\u099b\u09c7\u0964',
      errMemberRemove: '\u099a\u09be\u0981\u09a6\u09be \u09ac\u09be \u09aa\u09be\u0993\u09a8\u09be\u09b0 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u0986\u099b\u09c7 \u098f\u09ae\u09a8 \u09b8\u09a6\u09b8\u09cd\u09af\u0995\u09c7 \u09b8\u09b0\u09be\u09a8\u09cb \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964',
      addMonth: '\u09aa\u09b0\u09c7\u09b0 \u09ae\u09be\u09b8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      contribHint: '\u0995\u09cb\u09a8\u09cb \u0998\u09b0\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09b2\u09c7 \u09b8\u09c7\u0987 \u09ae\u09be\u09b8 \u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4/\u0985\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4 \u09b9\u09ac\u09c7\u0964',
      contribEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09ae\u09be\u09b8 \u09a8\u09c7\u0987\u0964 \u0989\u09aa\u09b0\u09c7 \u09aa\u09cd\u09b0\u09a5\u09ae \u09ae\u09be\u09b8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
      rotationHint: '\u09aa\u09cd\u09b0\u09a4\u09bf \u09ae\u09be\u09b8\u09c7 \u098f\u0995\u099c\u09a8 \u09b8\u09a6\u09b8\u09cd\u09af \u09aa\u09c1\u09b0\u09cb \u09aa\u099f \u09aa\u09be\u09a8, \u09a4\u09be\u09b2\u09bf\u0995\u09be\u09b0 \u0995\u09cd\u09b0\u09ae \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0\u0964 \u09aa\u09be\u0993\u09a8\u09be \u09b9\u09b8\u09cd\u09a4\u09be\u09a8\u09cd\u09a4\u09b0 \u09b9\u09b2\u09c7 \u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4 \u099a\u09bf\u09b9\u09cd\u09a8\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8\u0964',
      thMonth: '\u09ae\u09be\u09b8', thReceiver: '\u09aa\u09cd\u09b0\u09be\u09aa\u0995', thCycle: '\u099a\u0995\u09cd\u09b0', thPayout: '\u09aa\u09be\u0993\u09a8\u09be', markPaid: '\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8', markUnpaid: '\u0985\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8', paid: '\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4', unpaid: '\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4 \u09a8\u09af\u09bc',
      export: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f',
      import: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
      dataOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      dataBad: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5: \u09ab\u09be\u0987\u09b2\u099f\u09bf \u09b8\u09a0\u09bf\u0995 \u09b8\u09ae\u09bf\u09a4\u09bf \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u09a8\u09af\u09bc\u0964',
      eraseHint: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09a4\u09c7: \u09ac\u09be\u0995\u09cd\u09b8\u09c7 DELETE \u09b2\u09bf\u0996\u09c7 \u09ae\u09c1\u099b\u09c1\u09a8 \u099a\u09be\u09aa\u09c1\u09a8\u0964',
      erase: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8',
      foot: '\u09a8\u09bf\u099c\u09c7\u09b0 \u09b8\u09ae\u09bf\u09a4\u09bf\u09b0 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0\u0964 \u098f\u0996\u09be\u09a8\u09c7 \u0986\u09aa\u09a8\u09bf \u09af\u09be \u09b2\u09bf\u0996\u09ac\u09c7\u09a8, \u09a4\u09be\u0987 \u09a6\u09c7\u0996\u09be\u09ac\u09c7 \u2014 \u098f\u0987 \u0985\u09cd\u09af\u09be\u09aa \u099f\u09be\u0995\u09be \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u0995\u09b0\u09c7 \u09a8\u09be, \u09b8\u09a6\u09b8\u09cd\u09af\u09a6\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c7 \u09a8\u09be, \u09ac\u09be \u09aa\u09b0\u09bf\u09b6\u09cb\u09a7 \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09c7 \u09a8\u09be\u0964 \u09a8\u09bf\u09b0\u09cd\u09ad\u09b0 \u0995\u09b0\u09be\u09b0 \u0986\u0997\u09c7 \u0997\u09cd\u09b0\u09c1\u09aa\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09aa\u09be\u0993\u09a8\u09be \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09c1\u09a8\u0964',
      none: '\u2014',
      confirmNew: '\u09a8\u09a4\u09c1\u09a8 \u09b8\u09ae\u09bf\u09a4\u09bf \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09ac\u09c7\u09a8? \u09ac\u09b0\u09cd\u09a4\u09ae\u09be\u09a8 \u0997\u09cd\u09b0\u09c1\u09aa \u0993 \u09b8\u09ac \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u09ac\u09a6\u09b2\u09c7 \u09af\u09be\u09ac\u09c7\u0964'
    }
  };

  function $(id) { return document.getElementById(id); }
  function t(key) { return STR[state.lang][key]; }

  function todayMonth() {
    var q = new URLSearchParams(location.search).get('asof');
    var d = q ? new Date(q + 'T00:00:00') : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function uid() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  var state = load();
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.version === 1 && data.group === null) {
          return { lang: data.lang === 'bn' ? 'bn' : 'en', group: null, months: [], payments: {}, payouts: [] };
        }
        // Lenient load check: import validation requires 2+ members, but a
        // group reduced to 1 member by removal must still reload intact.
        if (data && data.version === 1 && data.group &&
            L.isValidName(data.group.name) && L.isValidMonth(data.group.startMonth) &&
            L.isValidAmountPaisa(data.group.contributionPaisa) &&
            Array.isArray(data.group.members) && data.group.members.length >= 1 &&
            data.group.members.every(function (m) { return m && typeof m.id === 'string' && m.id && L.isValidName(m.name); }) &&
            Array.isArray(data.months) && data.payments && typeof data.payments === 'object' &&
            Array.isArray(data.payouts)) {
          return { lang: data.lang === 'bn' ? 'bn' : 'en', group: data.group, months: data.months, payments: data.payments, payouts: data.payouts };
        }
      }
    } catch (e) { /* corrupted storage -> fresh state */ }
    return { lang: 'en', group: null, months: [], payments: {}, payouts: [] };
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, lang: state.lang, group: state.group, months: state.months, payments: state.payments, payouts: state.payouts }));
  }

  function bnNum() { return state.lang === 'bn'; }
  function money(p) { return L.formatBdt(p, bnNum()); }

  function payoutFor(month) {
    for (var i = 0; i < state.payouts.length; i++) {
      if (state.payouts[i].month === month) return state.payouts[i];
    }
    return null;
  }
  function ensurePayout(month) {
    var r = L.recipientForMonth(state.group, month);
    if (!r) return null;
    var p = payoutFor(month);
    if (!p) {
      p = { month: month, memberId: r.memberId, amountPaisa: state.group.members.length * state.group.contributionPaisa, paid: false };
      state.payouts.push(p);
    }
    return p;
  }

  function showError(el, msg) { el.textContent = msg; el.hidden = !msg; }

  function renderLang() {
    $('langBtn').textContent = state.lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English';
    $('appSub').textContent = t('sub');
    $('setupTitle').textContent = t('setupTitle');
    $('setupHint').textContent = t('setupHint');
    $('lblGroupName').textContent = t('groupName');
    $('lblContribution').textContent = t('contribution');
    $('lblStartMonth').textContent = t('startMonth');
    $('lblMembers').textContent = t('members');
    $('createBtn').textContent = t('create');
    $('resetGroupBtn').textContent = t('newGroup');
    $('stPot').textContent = t('pot');
    $('stCollected').textContent = t('collected');
    $('stOutstanding').textContent = t('outstanding');
    $('stRate').textContent = t('rate');
    $('stRecipient').textContent = t('recipient');
    $('stNext').textContent = t('next');
    $('tabMembers').textContent = t('tabs')[0];
    $('tabContrib').textContent = t('tabs')[1];
    $('tabRotation').textContent = t('tabs')[2];
    $('tabData').textContent = t('tabs')[3];
    $('addMemberBtn').textContent = t('addMember');
    $('newMemberName').placeholder = t('memberNamePh');
    $('thMember').textContent = t('thMember');
    $('thPaid').textContent = t('thPaid');
    $('thDue').textContent = t('thDue');
    $('thOut').textContent = t('thOut');
    $('memberNote').textContent = t('memberNote');
    $('addMonthBtn').textContent = t('addMonth');
    $('contribHint').textContent = t('contribHint');
    $('contribEmpty').textContent = t('contribEmpty');
    $('rotationHint').textContent = t('rotationHint');
    $('thMonth').textContent = t('thMonth');
    $('thReceiver').textContent = t('thReceiver');
    $('thCycle').textContent = t('thCycle');
    $('thPayout').textContent = t('thPayout');
    $('exportBtn').textContent = t('export');
    $('importLabel').textContent = t('import');
    $('eraseHint').textContent = t('eraseHint');
    $('eraseBtn').textContent = t('erase');
    $('footNote').textContent = t('foot');
  }

  function render() {
    renderLang();
    var hasGroup = !!state.group;
    $('setupCard').hidden = hasGroup;
    $('appCard').hidden = !hasGroup;
    if (!hasGroup) return;
    var g = state.group;
    g.months = state.months;
    $('groupNameOut').textContent = g.name;
    $('groupMeta').textContent = t('meta')
      .replace('{n}', bnNum() ? String(g.members.length).replace(/\d/g, function (d) { return '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'[+d]; }) : g.members.length)
      .replace('{amt}', money(g.contributionPaisa))
      .replace('{m}', g.startMonth);
    var d = L.dashboard(g, state.payments, state.payouts);
    $('vPot').textContent = money(d.potPaisa);
    $('vCollected').textContent = money(d.collectedPaisa);
    $('vOutstanding').textContent = money(d.outstandingPaisa);
    $('vRate').textContent = (bnNum() ? String(d.collectionRate).replace(/\d/g, function (x) { return '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'[+x]; }) : d.collectionRate) + '%';
    var tm = todayMonth();
    var rec = L.recipientForMonth(g, tm);
    var recName = rec ? memberName(rec.memberId) : t('none');
    $('vRecipient').textContent = rec ? recName + ' (' + tm + ')' : t('none');
    var nextMonth = state.months.length ? state.months[state.months.length - 1] : null;
    var nextRec = null;
    if (nextMonth) {
      var nm = L.addMonths(nextMonth, 1);
      nextRec = L.recipientForMonth(g, nm);
      $('vNext').textContent = nextRec ? memberName(nextRec.memberId) + ' (' + nm + ')' : t('none');
    } else {
      $('vNext').textContent = t('none');
    }
    renderMembers(d);
    renderContrib();
    renderRotation();
  }

  function memberName(id) {
    for (var i = 0; i < state.group.members.length; i++) {
      if (state.group.members[i].id === id) return state.group.members[i].name;
    }
    return t('none');
  }

  function renderMembers(d) {
    var body = $('memberBody');
    body.innerHTML = '';
    state.group.members.forEach(function (m) {
      var tot = d.memberTotals[m.id] || { paidPaisa: 0, duePaisa: 0, outstandingPaisa: 0 };
      var tr = document.createElement('tr');
      var tdN = document.createElement('td'); tdN.textContent = m.name;
      var tdP = document.createElement('td'); tdP.textContent = money(tot.paidPaisa);
      var tdD = document.createElement('td'); tdD.textContent = money(tot.duePaisa);
      var tdO = document.createElement('td'); tdO.textContent = money(tot.outstandingPaisa);
      var tdR = document.createElement('td');
      var btn = document.createElement('button');
      btn.className = 'mini'; btn.textContent = t('remove');
      btn.addEventListener('click', function () { removeMember(m.id); });
      tdR.appendChild(btn);
      tr.append(tdN, tdP, tdD, tdO, tdR);
      body.appendChild(tr);
    });
  }

  function renderContrib() {
    var head = $('contribHead'), body = $('contribBody');
    head.innerHTML = ''; body.innerHTML = '';
    $('contribEmpty').hidden = state.months.length > 0;
    if (!state.months.length) return;
    var hr = document.createElement('tr');
    var th0 = document.createElement('th'); th0.textContent = t('thMember'); hr.appendChild(th0);
    state.months.forEach(function (ym) {
      var th = document.createElement('th'); th.textContent = ym; hr.appendChild(th);
    });
    head.appendChild(hr);
    state.group.members.forEach(function (m) {
      var tr = document.createElement('tr');
      var td0 = document.createElement('td'); td0.textContent = m.name; tr.appendChild(td0);
      state.months.forEach(function (ym) {
        var td = document.createElement('td'); td.className = 'paid-cell';
        var key = m.id + '|' + ym;
        var btn = document.createElement('button');
        var paid = !!state.payments[key];
        btn.className = paid ? 'paid-yes' : 'paid-no';
        btn.textContent = paid ? '\u2713' : '\u2013';
        btn.setAttribute('aria-label', m.name + ' ' + ym);
        btn.addEventListener('click', function () {
          if (state.payments[key]) delete state.payments[key]; else state.payments[key] = true;
          save(); render();
        });
        td.appendChild(btn); tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  function renderRotation() {
    var body = $('rotationBody');
    body.innerHTML = '';
    var count = Math.max(state.group.members.length * 2, state.months.length + 1);
    var sched = L.rotationSchedule(state.group, count);
    sched.forEach(function (row) {
      var p = ensurePayout(row.month);
      var tr = document.createElement('tr');
      var tdM = document.createElement('td'); tdM.textContent = row.month;
      var tdR = document.createElement('td'); tdR.textContent = memberName(row.memberId);
      var tdC = document.createElement('td'); tdC.textContent = bnNum() ? String(row.cycle).replace(/\d/g, function (x) { return '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'[+x]; }) : row.cycle;
      var tdP = document.createElement('td'); tdP.textContent = p.paid ? t('paid') : t('unpaid');
      var tdB = document.createElement('td');
      var btn = document.createElement('button');
      btn.className = 'mini'; btn.textContent = p.paid ? t('markUnpaid') : t('markPaid');
      btn.addEventListener('click', function () { p.paid = !p.paid; save(); render(); });
      tdB.appendChild(btn);
      tr.append(tdM, tdR, tdC, tdP, tdB);
      body.appendChild(tr);
    });
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    document.querySelectorAll('.pane').forEach(function (p) {
      p.hidden = p.id !== 'pane-' + name;
    });
  }

  // --- events ---
  $('langBtn').addEventListener('click', function () {
    state.lang = state.lang === 'en' ? 'bn' : 'en';
    save(); render();
  });

  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { switchTab(b.dataset.tab); });
  });

  $('createBtn').addEventListener('click', function () {
    var name = $('groupName').value.trim();
    var amt = L.parseBdtToPaisa($('contribution').value);
    var start = $('startMonth').value;
    var names = $('memberNames').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!L.isValidName(name)) return showError($('setupError'), t('errGroup'));
    if (amt === null) return showError($('setupError'), t('errAmount'));
    if (!L.isValidMonth(start)) return showError($('setupError'), t('errStart'));
    if (names.length < 2) return showError($('setupError'), t('errMembers'));
    if (new Set(names).size !== names.length) return showError($('setupError'), t('errDup'));
    state.group = { name: name, startMonth: start, contributionPaisa: amt, members: names.map(function (n) { return { id: uid(), name: n }; }) };
    state.months = [start];
    state.payments = {};
    state.payouts = [];
    showError($('setupError'), '');
    save(); render(); switchTab('members');
  });

  $('resetGroupBtn').addEventListener('click', function () {
    if (!confirm(t('confirmNew'))) return;
    state.group = null; state.months = []; state.payments = {}; state.payouts = [];
    save(); render();
  });

  $('addMemberBtn').addEventListener('click', function () {
    var name = $('newMemberName').value.trim();
    if (!L.isValidName(name)) return showError($('memberError'), t('errMemberName'));
    if (state.group.members.some(function (m) { return m.name === name; })) {
      return showError($('memberError'), t('errMemberDup'));
    }
    state.group.members.push({ id: uid(), name: name });
    $('newMemberName').value = '';
    showError($('memberError'), '');
    save(); render();
  });

  function removeMember(id) {
    var hasRecord = Object.keys(state.payments).some(function (k) { return k.split('|')[0] === id; }) ||
      state.payouts.some(function (p) { return p.memberId === id && p.paid; });
    if (hasRecord) return showError($('memberError'), t('errMemberRemove'));
    state.group.members = state.group.members.filter(function (m) { return m.id !== id; });
    state.payouts = state.payouts.filter(function (p) { return p.memberId !== id; });
    if (state.group.members.length < 2) {
      // Rotation needs 2+ members; keep group but block further removal via note.
      // (UI still allows re-adding; rotation math handles any count >= 1.)
    }
    showError($('memberError'), '');
    save(); render();
  }

  $('addMonthBtn').addEventListener('click', function () {
    if (!state.months.length) { state.months = [state.group.startMonth]; }
    else {
      var last = state.months[state.months.length - 1];
      var next = L.addMonths(last, 1);
      if (state.months.indexOf(next) === -1) state.months.push(next);
    }
    save(); render();
  });

  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ version: 1, lang: state.lang, group: state.group, months: state.months, payments: state.payments, payouts: state.payouts }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'samity-tracker-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('importFile').addEventListener('change', function (ev) {
    var f = ev.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var v = L.validateImport(data);
        if (!v.ok) throw new Error('invalid');
        state.group = data.group; state.months = data.months;
        state.payments = data.payments; state.payouts = data.payouts;
        save(); render();
        var msg = $('dataMsg'); msg.textContent = t('dataOk'); msg.hidden = false;
      } catch (e) {
        var msg2 = $('dataMsg'); msg2.textContent = t('dataBad'); msg2.hidden = false;
      }
    };
    reader.readAsText(f);
    ev.target.value = '';
  });

  $('eraseBtn').addEventListener('click', function () {
    if ($('eraseConfirm').value.trim() !== 'DELETE') return;
    localStorage.removeItem(KEY);
    state = { lang: state.lang, group: null, months: [], payments: {}, payouts: [] };
    $('eraseConfirm').value = '';
    save(); render();
  });

  render();
})();
