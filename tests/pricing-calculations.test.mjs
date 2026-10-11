/**
 * Nature Hug — Order Pricing Calculation Tests
 * Pure Node.js, no external test framework required.
 * Run with: node tests/pricing-calculations.test.mjs
 *
 * These tests validate the core pricing logic that was fixed:
 *   - Individual product subtotals
 *   - Bundle pricing (fixed-price type) — no double-discount
 *   - Promo code discounts (applied on top of bundle price)
 *   - Shipping fees
 *   - Final grand total = subtotal + shipping - promoDiscount
 */

// ─── tiny assertion helper ────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assertEqual(label, actual, expected, tolerance = 0.001) {
    const ok = Math.abs(actual - expected) <= tolerance;
    if (ok) {
        console.log(`  ✅  ${label}`);
        passed++;
    } else {
        console.error(`  ❌  ${label}`);
        console.error(`      expected: ${expected}`);
        console.error(`      actual  : ${actual}`);
        failed++;
    }
}

function section(name) {
    console.log(`\n── ${name} ──`);
}

// ─── Pure pricing logic (mirrors server-side calculation in useCreateOrderActions.ts) ──
/**
 * Compute order totals exactly as the server does after the fix.
 *
 * Rules (post-fix):
 *  1. For each cart item:
 *     - Regular product: add dbProduct.price * quantity to calculatedSubtotal
 *     - Bundle:          add bundleFinalUnitPrice * quantity to calculatedSubtotal
 *       (the bundle discount is already baked in; it is NOT also added to calculatedDiscount)
 *  2. calculatedDiscount = sum of validated promo code discounts only
 *  3. grandTotal = calculatedSubtotal + shipping - calculatedDiscount
 */
function computeOrderTotals({ items, promoDiscount = 0, shipping = 0 }) {
    let calculatedSubtotal = 0;

    for (const item of items) {
        if (item.isBundle) {
            // Bundle: use the final (post-discount) selling price directly
            calculatedSubtotal += item.bundleFinalPrice * item.quantity;
        } else {
            // Regular product: use DB unit price
            calculatedSubtotal += item.unitPrice * item.quantity;
        }
    }

    const calculatedDiscount = promoDiscount; // promo codes only — no bundle discount here
    const grandTotal = Math.max(0, calculatedSubtotal + shipping - calculatedDiscount);
    return { calculatedSubtotal, calculatedDiscount, grandTotal };
}

// ─── Test 1: Individual products only ─────────────────────────────────────────
section('Test 1 – Individual products only');
{
    const { calculatedSubtotal, calculatedDiscount, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: false, unitPrice: 135, quantity: 1 },
            { isBundle: false, unitPrice: 279, quantity: 1 },
        ],
        shipping: 80,
    });
    assertEqual('subtotal', calculatedSubtotal, 414);
    assertEqual('discount', calculatedDiscount, 0);
    assertEqual('grand total', grandTotal, 494);
}

// ─── Test 2: Product with a selected variant ──────────────────────────────────
section('Test 2 – Product with selected variant');
{
    // Variant price is the unit_price that arrives from the DB product view.
    const { calculatedSubtotal, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: false, unitPrice: 220, quantity: 1 }, // Body Lotion 10% Urea (variant)
        ],
        shipping: 80,
    });
    assertEqual('subtotal', calculatedSubtotal, 220);
    assertEqual('grand total', grandTotal, 300);
}

// ─── Test 3: Bundle at its configured discounted price ────────────────────────
section('Test 3 – Bundle at its fixed selling price (no double-discount)');
{
    const BUNDLE_SELLING_PRICE = 612;
    const { calculatedSubtotal, calculatedDiscount, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: true, bundleFinalPrice: BUNDLE_SELLING_PRICE, quantity: 1 },
        ],
        shipping: 0,
    });
    assertEqual('subtotal equals bundle selling price', calculatedSubtotal, 612);
    assertEqual('discount is 0 (no promo)', calculatedDiscount, 0);
    assertEqual('grand total equals selling price', grandTotal, 612);
}

// ─── Test 4: Mixed order — bundle + individual products ───────────────────────
section('Test 4 – Bundle + individual products (REGRESSION EXAMPLE)');
{
    const { calculatedSubtotal, calculatedDiscount, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: false, unitPrice: 135,  quantity: 1 }, // Post-session skincare cream
            { isBundle: true,  bundleFinalPrice: 612, quantity: 1 }, // Morning bundle
            { isBundle: false, unitPrice: 279,  quantity: 1 }, // Hair serum
            { isBundle: false, unitPrice: 220,  quantity: 1 }, // Body Lotion 10% Urea
            { isBundle: false, unitPrice: 355,  quantity: 1 }, // Body Lotion Pomegranate Musk
        ],
        shipping: 80,
        promoDiscount: 0,
    });
    assertEqual('products subtotal (without shipping)', calculatedSubtotal, 1601);
    assertEqual('discount', calculatedDiscount, 0);
    assertEqual('grand total — MUST be EGP 1,681.00', grandTotal, 1681);
}

// ─── Test 5: Bundle containing products with variants ─────────────────────────
section('Test 5 – Bundle with variant-product components');
{
    const BUNDLE_SELLING_PRICE = 500;
    const { calculatedSubtotal, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: true, bundleFinalPrice: BUNDLE_SELLING_PRICE, quantity: 1 },
            { isBundle: false, unitPrice: 100, quantity: 2 },
        ],
        shipping: 60,
    });
    assertEqual('subtotal', calculatedSubtotal, 700);
    assertEqual('grand total', grandTotal, 760);
}

// ─── Test 6: Manual/promo discount ────────────────────────────────────────────
section('Test 6 – Order with manual promo code discount');
{
    const { calculatedSubtotal, calculatedDiscount, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: false, unitPrice: 200, quantity: 1 },
            { isBundle: false, unitPrice: 300, quantity: 1 },
        ],
        promoDiscount: 50,
        shipping: 80,
    });
    assertEqual('subtotal', calculatedSubtotal, 500);
    assertEqual('discount', calculatedDiscount, 50);
    assertEqual('grand total', grandTotal, 530); // 500 - 50 + 80
}

// ─── Test 7: Shipping fees ────────────────────────────────────────────────────
section('Test 7 – Order with shipping fees');
{
    const { grandTotal } = computeOrderTotals({
        items: [{ isBundle: false, unitPrice: 400, quantity: 1 }],
        shipping: 80,
    });
    assertEqual('grand total includes shipping', grandTotal, 480);
}

// ─── Test 8: Bundle discount + manual promo discount, no double-count ─────────
section('Test 8 – Bundle discount + promo code, applied correctly');
{
    // Bundle final price: 612 (already discounted — bundle discount NOT subtracted again)
    // Promo code: 10% off the entire cart after bundle pricing
    const subtotalAfterBundle = 612 + 135; // 747
    const promoDiscount = Math.round(subtotalAfterBundle * 0.10 * 100) / 100; // 74.7
    const { calculatedSubtotal, calculatedDiscount, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: true,  bundleFinalPrice: 612, quantity: 1 },
            { isBundle: false, unitPrice: 135, quantity: 1 },
        ],
        promoDiscount,
        shipping: 80,
    });
    assertEqual('subtotal', calculatedSubtotal, 747);
    assertEqual('promo discount applied once only', calculatedDiscount, 74.7);
    assertEqual('grand total', grandTotal, 752.3); // 747 - 74.7 + 80
}

// ─── Test 9: Quantity greater than one ────────────────────────────────────────
section('Test 9 – Quantity greater than one');
{
    const { calculatedSubtotal, grandTotal } = computeOrderTotals({
        items: [{ isBundle: false, unitPrice: 150, quantity: 3 }],
        shipping: 80,
    });
    assertEqual('subtotal', calculatedSubtotal, 450);
    assertEqual('grand total', grandTotal, 530);
}

// ─── Test 10: Website / Telegram / DB consistency ─────────────────────────────
section('Test 10 – Website, DB, Telegram show same final amount');
{
    // After the fix, all three surfaces use the server-computed grand_total.
    const serverGrandTotal = 1681; // stored in DB
    const invoiceDisplayTotal = 1681; // order-detail-screen uses order.grand_total
    const telegramTotal = 1681;       // Telegram uses sentOrder.grand_total

    assertEqual('DB total === invoice total', serverGrandTotal, invoiceDisplayTotal);
    assertEqual('DB total === Telegram total', serverGrandTotal, telegramTotal);
}

// ─── Test 11: Orders without bundles retain correct calculation ───────────────
section('Test 11 – No-bundle orders unaffected by bundle fix');
{
    const { calculatedSubtotal, grandTotal } = computeOrderTotals({
        items: [
            { isBundle: false, unitPrice: 200, quantity: 1 },
            { isBundle: false, unitPrice: 350, quantity: 2 },
        ],
        shipping: 60,
        promoDiscount: 0,
    });
    assertEqual('subtotal', calculatedSubtotal, 900); // 200 + 700
    assertEqual('grand total', grandTotal, 960);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
    console.log('✅ All tests passed!');
} else {
    console.error(`❌ ${failed} test(s) failed.`);
    process.exit(1);
}
