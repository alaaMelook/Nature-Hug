/**
 * fix-bundle-order-totals.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * يصلح الأوردرات اللي اتأثرت بالـ double-discount bug في bundle pricing.
 *
 * المشكلة:
 *   - الـ grand_total في قاعدة البيانات أقل من الصح بمقدار الـ bundle discount
 *     لأن الخصم اتطرح مرتين (مرة في الـ subtotal، ومرة في الـ discount_total).
 *
 * الحل:
 *   - كل أوردر فيه `__bundle_meta__:` في الـ note محتاج تصحيح.
 *   - correct_grand_total = stored_grand_total + bundleDiscount
 *   - bundleDiscount = sum of total_discount في الـ bundle_metadata.
 *
 * RUN (dry run first):
 *   node fix-bundle-order-totals.mjs
 *
 * RUN (to actually update):
 *   node fix-bundle-order-totals.mjs --apply
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let ws;
try { ws = require('ws'); } catch { ws = null; }

const SUPABASE_URL = 'https://uuqdrhjpbdcjyrdfeone.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cWRyaGpwYmRjanlyZGZlb25lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3NzY0NSwiZXhwIjoyMDkxMjUzNjQ1fQ.3uXTXoevSBPZ89sUBoa4BcOKaYjG2kM7esVzmIXUPb4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    realtime: ws ? { transport: ws } : undefined,
});

const APPLY = process.argv.includes('--apply');

console.log(APPLY
    ? '🚀 MODE: APPLY — سيتم تحديث قاعدة البيانات فعلاً'
    : '👁️  MODE: DRY RUN — بس هشوف إيه اللي هيتغير (مش هيتحفظ)'
);
console.log('─'.repeat(60));

async function main() {
    // 1. جيب كل الأوردرات اللي عندها bundle_meta في الـ note
    const { data: orders, error } = await supabase
        .schema('store')
        .from('orders')
        .select('id, subtotal, discount_total, shipping_total, grand_total, note')
        .like('note', '%__bundle_meta__%')
        .order('id', { ascending: false });

    if (error) {
        console.error('❌ فشل جلب الأوردرات:', error.message);
        process.exit(1);
    }

    console.log(`\n📋 أوردرات فيها bundle metadata: ${orders.length}`);

    if (orders.length === 0) {
        console.log('✅ مفيش أوردرات محتاجة تصحيح.');
        return;
    }

    const toUpdate = [];
    const skipped  = [];

    for (const order of orders) {
        // 2. استخرج الـ bundle_metadata من الـ note
        const metaMatch = order.note?.match(/__bundle_meta__:(.+)$/m);
        if (!metaMatch) {
            skipped.push({ id: order.id, reason: 'no parseable bundle_meta' });
            continue;
        }

        let bundleMeta;
        try {
            bundleMeta = JSON.parse(metaMatch[1]);
        } catch {
            skipped.push({ id: order.id, reason: 'JSON parse error' });
            continue;
        }

        // 3. احسب الـ bundle discount من الـ metadata
        const bundleDiscount = (bundleMeta || []).reduce(
            (sum, b) => sum + (b.total_discount || 0), 0
        );

        if (bundleDiscount <= 0) {
            skipped.push({ id: order.id, reason: 'bundle discount = 0, no fix needed' });
            continue;
        }

        // 4. احسب الـ grand_total الصح
        //    الصح = subtotal + shipping - promoDiscount
        //    promoDiscount = discount_total - bundleDiscount (كل اللي زاد هو bundle discount)
        const promoDiscount = Math.max(0, order.discount_total - bundleDiscount);
        const correctGrandTotal = Math.round(
            (order.subtotal + order.shipping_total - promoDiscount) * 100
        ) / 100;
        const correctDiscountTotal = Math.round(promoDiscount * 100) / 100;

        // 5. لو الأرقام مختلفة → محتاج تصحيح
        const grandTotalDiff = Math.abs(correctGrandTotal - order.grand_total);

        if (grandTotalDiff < 0.01) {
            skipped.push({ id: order.id, reason: 'already correct' });
            continue;
        }

        toUpdate.push({
            id: order.id,
            old_grand_total: order.grand_total,
            old_discount_total: order.discount_total,
            new_grand_total: correctGrandTotal,
            new_discount_total: correctDiscountTotal,
            bundle_discount: bundleDiscount,
            promo_discount: promoDiscount,
        });
    }

    // ──── Report ────────────────────────────────────────────────────────────

    console.log(`\n✅ أوردرات صح أو مش محتاجة تصحيح: ${skipped.length}`);
    if (skipped.length > 0) {
        for (const s of skipped) {
            console.log(`   #${s.id}: ${s.reason}`);
        }
    }

    console.log(`\n🔧 أوردرات محتاجة تصحيح: ${toUpdate.length}`);
    console.log('');

    if (toUpdate.length === 0) {
        console.log('✅ الكل تمام، مفيش حاجة اتغيرت.');
        return;
    }

    // اطبع جدول بالتغييرات
    console.log(
        'ID'.padEnd(8) +
        'Grand Total (قديم)'.padEnd(22) +
        'Grand Total (جديد)'.padEnd(22) +
        'Bundle Discount'.padEnd(18) +
        'Promo Discount'
    );
    console.log('─'.repeat(85));
    for (const u of toUpdate) {
        console.log(
            `#${u.id}`.padEnd(8) +
            `${u.old_grand_total.toFixed(2)}`.padEnd(22) +
            `${u.new_grand_total.toFixed(2)}`.padEnd(22) +
            `${u.bundle_discount.toFixed(2)}`.padEnd(18) +
            `${u.promo_discount.toFixed(2)}`
        );
    }

    if (!APPLY) {
        console.log('\n⚠️  Dry run — مش هيتحفظ. شغّل بـ --apply عشان تطبّق التغييرات:');
        console.log('   node fix-bundle-order-totals.mjs --apply\n');
        return;
    }

    // ──── Apply ─────────────────────────────────────────────────────────────
    console.log('\n📝 بيحدّث قاعدة البيانات...\n');
    let successCount = 0;
    let errorCount   = 0;

    for (const u of toUpdate) {
        const { error: updateError } = await supabase
            .schema('store')
            .from('orders')
            .update({
                grand_total:    u.new_grand_total,
                discount_total: u.new_discount_total,
            })
            .eq('id', u.id);

        if (updateError) {
            console.error(`   ❌ فشل تحديث أوردر #${u.id}:`, updateError.message);
            errorCount++;
        } else {
            console.log(
                `   ✅ أوردر #${u.id}: ` +
                `${u.old_grand_total.toFixed(2)} → ${u.new_grand_total.toFixed(2)} ج.م`
            );
            successCount++;
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`النتيجة: ✅ ${successCount} تم تصحيحه | ❌ ${errorCount} فشل`);

    if (errorCount === 0) {
        console.log('🎉 كل الأوردرات اتصلحت بنجاح!');
    }
}

main().catch(err => {
    console.error('❌ خطأ غير متوقع:', err);
    process.exit(1);
});
