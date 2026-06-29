#!/usr/bin/env node
/**
 * Admin CLI — issue sovereign activation codes (AUN-{PLAN}-XXXX-YYYY).
 *
 * Usage:
 *   node scripts/issue.js                    # one TUTOR code
 *   node scripts/issue.js --plan medical --count 5
 *   node scripts/issue.js --plan assess --student recXXXXXXXX
 *
 * Plans: free | tutor | medical | institution | assess
 */

const PLAN_MAP = {
  free: 'FREE',
  tutor: 'TUTOR',
  medical: 'MEDICAL',
  institution: 'INST',
  inst: 'INST',
  assess: 'ASSESS',
  assessment: 'ASSESS',
  assessment_only: 'ASSESS',
};

const PLAN_CANONICAL = {
  FREE: 'free',
  TUTOR: 'tutor',
  MEDICAL: 'medical',
  INST: 'institution',
  ASSESS: 'assessment_only',
};

function parseArgs(argv) {
  const out = { plan: 'tutor', count: 1, studentId: null, year: new Date().getFullYear() };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--plan' || a === '-p') out.plan = String(argv[++i] ?? 'tutor').toLowerCase();
    else if (a === '--count' || a === '-n') out.count = Math.max(1, parseInt(argv[++i], 10) || 1);
    else if (a === '--student' || a === '-s') out.studentId = argv[++i] ?? null;
    else if (a === '--year' || a === '-y') out.year = parseInt(argv[++i], 10) || out.year;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function generateCode(planKey, year) {
  const prefix = PLAN_MAP[planKey];
  if (!prefix) {
    throw new Error(`Unknown plan "${planKey}". Use: free | tutor | medical | institution | assess`);
  }
  const seg = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  return `AUN-${prefix}-${seg}-${year}`;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`
Aunak Activation Code Issuer
────────────────────────────
  node scripts/issue.js [--plan tutor] [--count 1] [--student recId] [--year 2026]

Plans: free, tutor, medical, institution (inst), assess
Format: AUN-{PLAN}-XXXX-YYYY
`);
    process.exit(0);
  }

  const canonical = PLAN_CANONICAL[PLAN_MAP[args.plan]];
  const issued = [];
  for (let i = 0; i < args.count; i++) {
    const code = generateCode(args.plan, args.year);
    issued.push({
      code,
      plan: canonical,
      status: 'Unused',
      issuedAt: new Date().toISOString(),
      issuedBy: 'admin_cli',
      studentId: args.studentId,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
  }

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Aunak Sovereign Activation Codes       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  for (const entry of issued) {
    console.log(`  CODE:  ${entry.code}`);
    console.log(`  PLAN:  ${entry.plan}`);
    console.log(`  EXP:   ${entry.expiresAt.slice(0, 10)}`);
    if (entry.studentId) console.log(`  STUD:  ${entry.studentId}`);
    console.log('');
  }

  console.log(`Issued ${issued.length} code(s) for plan "${canonical}".`);
  console.log('Distribute manually after payment confirmation.\n');

  if (process.env.ISSUE_JSON === '1') {
    console.log(JSON.stringify(issued, null, 2));
  }
}

main();
