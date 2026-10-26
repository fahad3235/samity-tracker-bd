// Samity Tracker BD \u2014 pure logic (no DOM). Testable under Node and in the browser.
// A samity is a rotating savings group: N members each pay a fixed monthly
// contribution; one member receives the whole pot each month, in rotation order.
//
// Money is integer paisa (BDT x 100) everywhere to avoid float error.
// Months are "YYYY-MM" strings. The rotation starts at startMonth: member i
// (0-based, in members order) receives the pot in month addMonths(startMonth, i).
// After every member has received once, the cycle repeats (cycle 2, ...).
(function (root) {
  'use strict';

  function addMonths(ym, n) {
    var parts = ym.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1 + n;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    return y + '-' + String(m + 1).padStart(2, '0');
  }

  function monthIndex(ym) {
    var parts = ym.split('-');
    return parseInt(parts[0], 10) * 12 + (parseInt(parts[1], 10) - 1);
  }

  function isValidMonth(ym) {
    if (typeof ym !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(ym)) return false;
    var y = parseInt(ym.slice(0, 4), 10);
    return y >= 2000 && y <= 2100;
  }

  function isValidName(s) {
    return typeof s === 'string' && s.trim().length > 0 && s.trim().length <= 60;
  }

  function isValidAmountPaisa(p) {
    return Number.isInteger(p) && p > 0 && p <= 100000000; // up to 10,00,000 BDT
  }

  // Parse a BDT amount string ("5000", "5000.50") into integer paisa, or null.
  function parseBdtToPaisa(s) {
    if (typeof s !== 'string') return null;
    var t = s.trim().replace(/,/g, '').replace(/[\u09e6-\u09ef]/g, function (d) {
      return String('\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'.indexOf(d));
    });
    if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
    var parts = t.split('.');
    var paisa = parseInt(parts[0], 10) * 100;
    if (parts[1]) paisa += parseInt((parts[1] + '00').slice(0, 2), 10);
    if (!isValidAmountPaisa(paisa)) return null;
    return paisa;
  }

  function formatBdt(paisa, bnDigits) {
    var neg = paisa < 0;
    var abs = Math.abs(paisa);
    var whole = Math.floor(abs / 100);
    var frac = abs % 100;
    var s = whole.toLocaleString('en-US') + '.' + String(frac).padStart(2, '0');
    if (bnDigits) {
      s = s.replace(/\d/g, function (d) { return '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'[parseInt(d, 10)]; });
    }
    return (neg ? '-' : '') + s;
  }

  // Who receives the pot in a given month, or null if month is before start
  // or the group has no members. Returns {memberId, memberIndex, cycle}.
  function recipientForMonth(group, ym) {
    if (!group || !group.members || group.members.length === 0) return null;
    if (!isValidMonth(ym) || !isValidMonth(group.startMonth)) return null;
    var offset = monthIndex(ym) - monthIndex(group.startMonth);
    if (offset < 0) return null;
    var n = group.members.length;
    return {
      memberId: group.members[offset % n].id,
      memberIndex: offset % n,
      cycle: Math.floor(offset / n) + 1,
      monthOffset: offset
    };
  }

  // Full rotation schedule for `count` months from startMonth.
  function rotationSchedule(group, count) {
    var out = [];
    for (var i = 0; i < count; i++) {
      var ym = addMonths(group.startMonth, i);
      var r = recipientForMonth(group, ym);
      out.push({ month: ym, memberId: r.memberId, cycle: r.cycle });
    }
    return out;
  }

  // Contribution record key: memberId + '|' + month.
  // payments: object keyed "memberId|YYYY-MM" -> true (paid).
  function memberTotals(group, payments) {
    var months = group.months || [];
    var per = {};
    group.members.forEach(function (m) {
      var paidCount = 0;
      months.forEach(function (ym) {
        if (payments[m.id + '|' + ym]) paidCount++;
      });
      per[m.id] = {
        paidMonths: paidCount,
        paidPaisa: paidCount * group.contributionPaisa,
        duePaisa: months.length * group.contributionPaisa,
        outstandingPaisa: (months.length - paidCount) * group.contributionPaisa
      };
    });
    return per;
  }

  // Dashboard aggregates for the group's recorded months.
  function dashboard(group, payments, payouts) {
    var totals = memberTotals(group, payments);
    var collected = 0;
    Object.keys(totals).forEach(function (id) { collected += totals[id].paidPaisa; });
    var paidOut = 0;
    (payouts || []).forEach(function (p) { if (p.paid) paidOut += p.amountPaisa; });
    var expected = group.members.length * group.contributionPaisa * group.months.length;
    var outstanding = expected - collected;
    var pot = group.members.length * group.contributionPaisa;
    return {
      potPaisa: pot,
      expectedPaisa: expected,
      collectedPaisa: collected,
      paidOutPaisa: paidOut,
      outstandingPaisa: outstanding,
      collectionRate: expected === 0 ? 0 : Math.round((collected / expected) * 10000) / 100,
      memberTotals: totals
    };
  }

  // Validate a whole imported data blob. Returns {ok, error?}.
  // Shape: {version:1, group:{name,startMonth,contributionPaisa,members:[{id,name}]},
  //         months:[...], payments:{...}, payouts:[{month,memberId,amountPaisa,paid}]}
  function validateImport(data) {
    if (!data || typeof data !== 'object' || data.version !== 1) {
      return { ok: false, error: 'bad-version' };
    }
    var g = data.group;
    if (!g || !isValidName(g.name) || !isValidMonth(g.startMonth) ||
        !isValidAmountPaisa(g.contributionPaisa)) {
      return { ok: false, error: 'bad-group' };
    }
    if (!Array.isArray(g.members) || g.members.length < 2 || g.members.length > 50) {
      return { ok: false, error: 'bad-members' };
    }
    var ids = {};
    for (var i = 0; i < g.members.length; i++) {
      var m = g.members[i];
      if (!m || typeof m.id !== 'string' || !m.id || !isValidName(m.name)) {
        return { ok: false, error: 'bad-member' };
      }
      if (ids[m.id]) return { ok: false, error: 'dup-member-id' };
      ids[m.id] = true;
    }
    if (!Array.isArray(data.months) || data.months.length > 120) {
      return { ok: false, error: 'bad-months' };
    }
    for (var j = 0; j < data.months.length; j++) {
      if (!isValidMonth(data.months[j])) return { ok: false, error: 'bad-month' };
    }
    if (!data.payments || typeof data.payments !== 'object' || Array.isArray(data.payments)) {
      return { ok: false, error: 'bad-payments' };
    }
    for (var k in data.payments) {
      if (data.payments[k] !== true) return { ok: false, error: 'bad-payment-value' };
      var parts = k.split('|');
      if (parts.length !== 2 || !ids[parts[0]] || !isValidMonth(parts[1])) {
        return { ok: false, error: 'bad-payment-key' };
      }
    }
    if (!Array.isArray(data.payouts)) return { ok: false, error: 'bad-payouts' };
    for (var p = 0; p < data.payouts.length; p++) {
      var po = data.payouts[p];
      if (!po || !isValidMonth(po.month) || !ids[po.memberId] ||
          !isValidAmountPaisa(po.amountPaisa) || typeof po.paid !== 'boolean') {
        return { ok: false, error: 'bad-payout' };
      }
    }
    return { ok: true };
  }

  function blankGroup() {
    return {
      name: '',
      startMonth: '',
      contributionPaisa: 0,
      members: []
    };
  }

  var api = {
    addMonths: addMonths, monthIndex: monthIndex, isValidMonth: isValidMonth,
    isValidName: isValidName, isValidAmountPaisa: isValidAmountPaisa,
    parseBdtToPaisa: parseBdtToPaisa, formatBdt: formatBdt,
    recipientForMonth: recipientForMonth, rotationSchedule: rotationSchedule,
    memberTotals: memberTotals, dashboard: dashboard,
    validateImport: validateImport, blankGroup: blankGroup
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SamityLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
