// Node unit tests for samity-tracker-bd logic. Run: node tests/tests.js
const L = require('../js/logic.js');
let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}

const group = {
  name: 'Para Samity', startMonth: '2026-10', contributionPaisa: 500000,
  members: [{ id: 'm1', name: 'Rahim' }, { id: 'm2', name: 'Karim' }, { id: 'm3', name: 'Sumon' }],
  months: ['2026-10', '2026-11', '2026-12']
};

// Rotation: Oct->m1, Nov->m2, Dec->m3, Jan->m1 cycle 2
eq('recipient Oct is m1', L.recipientForMonth(group, '2026-10').memberId, 'm1');
eq('recipient Dec is m3', L.recipientForMonth(group, '2026-12').memberId, 'm3');
eq('recipient Jan26 cycle 2', L.recipientForMonth(group, '2027-01').cycle, 2);
eq('recipient Jan26 is m1', L.recipientForMonth(group, '2027-01').memberId, 'm1');
eq('recipient before start null', L.recipientForMonth(group, '2026-09'), null);
eq('schedule length 5', L.rotationSchedule(group, 5).length, 5);
eq('schedule month 4', L.rotationSchedule(group, 5)[4].month, '2027-02');
eq('schedule month 4 member m2', L.rotationSchedule(group, 5)[4].memberId, 'm2');
eq('addMonths year roll', L.addMonths('2026-12', 1), '2027-01');
eq('addMonths leap safe', L.addMonths('2026-01', 13), '2027-02');
eq('valid month ok', L.isValidMonth('2026-10'), true);
eq('invalid month 13', L.isValidMonth('2026-13'), false);
eq('invalid month format', L.isValidMonth('2026-1'), false);

// Money parsing / formatting
eq('parse 5000', L.parseBdtToPaisa('5000'), 500000);
eq('parse 5000.50', L.parseBdtToPaisa('5000.50'), 500050);
eq('parse comma', L.parseBdtToPaisa('5,000'), 500000);
eq('parse Bangla digits', L.parseBdtToPaisa('\u09eb\u09e6\u09e6\u09e6'), 500000);
eq('parse bad text', L.parseBdtToPaisa('abc'), null);
eq('parse negative', L.parseBdtToPaisa('-500'), null);
eq('parse 3 decimals', L.parseBdtToPaisa('10.999'), null);
eq('parse zero', L.parseBdtToPaisa('0'), null);
eq('format 500000', L.formatBdt(500000, false), '5,000.00');
eq('format paisa 500050', L.formatBdt(500050, false), '5,000.50');
eq('format Bangla digits', L.formatBdt(500000, true), '\u09eb,\u09e6\u09e6\u09e6.\u09e6\u09e6');
eq('format negative', L.formatBdt(-150000, false), '-1,500.00');

// Contributions: m1 paid all 3 months, m2 paid 2, m3 paid 0
const payments = { 'm1|2026-10': true, 'm1|2026-11': true, 'm1|2026-12': true,
                   'm2|2026-10': true, 'm2|2026-12': true };
const totals = L.memberTotals(group, payments);
eq('m1 paidMonths', totals.m1.paidMonths, 3);
eq('m1 paidPaisa', totals.m1.paidPaisa, 1500000);
eq('m1 outstanding 0', totals.m1.outstandingPaisa, 0);
eq('m2 paidMonths', totals.m2.paidMonths, 2);
eq('m2 outstanding', totals.m2.outstandingPaisa, 500000);
eq('m3 paid 0', totals.m3.paidPaisa, 0);
eq('m3 outstanding full', totals.m3.outstandingPaisa, 1500000);

// Dashboard: expected 3 members x 5000 x 3 months = 45000; collected 25000
const payouts = [{ month: '2026-10', memberId: 'm1', amountPaisa: 1500000, paid: true },
                 { month: '2026-11', memberId: 'm2', amountPaisa: 1500000, paid: false }];
const d = L.dashboard(group, payments, payouts);
eq('pot 15000', d.potPaisa, 1500000);
eq('expected 45000', d.expectedPaisa, 4500000);
eq('collected 25000', d.collectedPaisa, 2500000);
eq('paidOut 15000', d.paidOutPaisa, 1500000);
eq('outstanding 20000', d.outstandingPaisa, 2000000);
eq('collection rate 55.56', d.collectionRate, 55.56);

// Empty group dashboard
const empty = { name: 'X', startMonth: '2026-10', contributionPaisa: 100000,
                members: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], months: [] };
const de = L.dashboard(empty, {}, []);
eq('empty expected 0', de.expectedPaisa, 0);
eq('empty rate 0', de.collectionRate, 0);

// Import validation
const good = { version: 1, group: { name: 'G', startMonth: '2026-10', contributionPaisa: 500000,
  members: [{ id: 'm1', name: 'R' }, { id: 'm2', name: 'K' }] },
  months: ['2026-10'], payments: { 'm1|2026-10': true },
  payouts: [{ month: '2026-10', memberId: 'm1', amountPaisa: 1000000, paid: true }] };
eq('import good', L.validateImport(good).ok, true);
eq('import bad version', L.validateImport({ version: 2 }).ok, false);
eq('import unknown member payment', L.validateImport({ ...good, payments: { 'zz|2026-10': true } }).ok, false);
eq('import payment not true', L.validateImport({ ...good, payments: { 'm1|2026-10': false } }).ok, false);
eq('import 1 member', L.validateImport({ ...good, group: { ...good.group, members: [{ id: 'm1', name: 'R' }] } }).ok, false);
eq('import dup member id', L.validateImport({ ...good, group: { ...good.group, members: [{ id: 'm1', name: 'R' }, { id: 'm1', name: 'K' }] } }).ok, false);
eq('import bad month', L.validateImport({ ...good, months: ['2026-13'] }).ok, false);
eq('import bad payout amount', L.validateImport({ ...good, payouts: [{ month: '2026-10', memberId: 'm1', amountPaisa: 0, paid: true }] }).ok, false);
eq('import null', L.validateImport(null).ok, false);
eq('import bad start month', L.validateImport({ ...good, group: { ...good.group, startMonth: '26-10' } }).ok, false);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
