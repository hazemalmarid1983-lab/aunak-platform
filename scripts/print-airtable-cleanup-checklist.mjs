/**
 * Print Airtable cleanup checklist (no deletes).
 * Usage: node scripts/print-airtable-cleanup-checklist.mjs
 */

import { AIRTABLE_CLEANUP_GUIDE } from '../src/lib/hubNavConfig.js';

console.log('\n=== عونك — تنظيف Airtable (بدون حذف تلقائي) ===\n');
console.log(AIRTABLE_CLEANUP_GUIDE.noteAr);
console.log('\n--- أبقِ (KEEP) ---');
for (const t of AIRTABLE_CLEANUP_GUIDE.keep) {
  console.log(`  ✓ ${t.name}  ${t.id || t.idEnv || ''}  — ${t.why}`);
}
console.log('\n--- أرشف لاحقاً (لا تحذف الآن) ---');
for (const t of AIRTABLE_CLEANUP_GUIDE.archiveLater) {
  console.log(`  ○ ${t.name}  ${t.id}  — ${t.why}`);
  console.log(`      اقتراح: أعد التسمية إلى ARCHIVE_${t.name.replace(/\s+/g, '_')}`);
}
console.log('\nفي الواجهة: الوحدات المسرحية مخفية إلا مع ?full=1\n');
