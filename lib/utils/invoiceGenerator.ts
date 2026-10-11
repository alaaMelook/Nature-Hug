import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import '@/public/fonts/NotoSansArabic-Regular.js';


// NOTE ON LOGO: The provided code uses a URL. To use your uploaded logo (logo (4).png)
// you must first convert it to a Base64 string and replace 'YOUR_BASE64_LOGO_STRING_HERE' below.
// For example: doc.addImage(base64ImageString, 'PNG', ...)
const containsArabic = (text: string) => {
    if (!text || text.length === 0) return false;
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
};
const formatCurrency = (amount: number) => {
    // Assuming EGP from your original code, can be changed.
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(amount);
};
const adjustFor = (doc: jsPDF, text: string) => {
    if (containsArabic(text)) {
        doc.setFont("NotoSansArabic-Regular", "normal");
        doc.setLanguage("ar");
    }
    else {
        doc.setFont("helvetica", "normal");
        doc.setLanguage("en");
    }
}
export const generateInvoicePDF = (orders: OrderDetailsView | OrderDetailsView[]) => {
    const orderList = Array.isArray(orders) ? orders : [orders];
    // Cast to include autotable methods for stricter TS environments
    const doc = new jsPDF() as jsPDF & {
        lastAutoTable: { finalY: number };
        autoTable: typeof autoTable;
    };
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    orderList.forEach((order, index) => {
        if (index > 0) {
            doc.addPage();
        }

        // --- Header ---
        const logoUrl = "/logo.png";
        const logoSize = 50; // Size in mm (slightly larger)
        const logoX = (pageWidth / 2) - (logoSize / 2);

        // 1. Center the Logo (adjust Y slightly higher)
        doc.addImage(logoUrl, "PNG", logoX, 0, logoSize, logoSize); // Disabled since base64 not provided

        // Brand Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(100, 80, 60); // Brownish tone from reference
        // Adjusted Y to assume logo space is reserved
        doc.text("NATURE HUG", pageWidth / 2, 50, { align: "center" });

        // Subtitle (Tagline)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("A hug for your skin and soul.", pageWidth / 2, 60, { align: "center" }); // Matches image's subtitle

        // Horizontal Line removed for a cleaner look
        // doc.line(15, 38, pageWidth - 15, 38);


        // --- Details Sections ---
        const startY = 75; // Adjusted Y to be lower after the new header
        const colPadding = 5;
        const leftColX = 20; // Start X for Bill To
        const rightColX = pageWidth / 2 + 10; // Start X for Invoice Details

        // Helper to align details on the right
        const detailsLabelX = rightColX;
        const detailsValueX = pageWidth - 20;

        // 2. Bill To (Left Column)
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("BILL TO:", leftColX, startY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        let currentBillY = startY + 6;
        adjustFor(doc, order.customer_name);
        doc.text(order.customer_name, leftColX, currentBillY, { isOutputRtl: containsArabic(order.customer_name) });
        currentBillY += 5;

        adjustFor(doc, order.shipping_street_address);
        const address = doc.splitTextToSize(order.shipping_street_address, pageWidth / 2);
        doc.text(address, leftColX, currentBillY);
        currentBillY += (address.length * 5);
        adjustFor(doc, order.shipping_governorate);
        doc.text(order.shipping_governorate, leftColX, currentBillY, { isOutputRtl: containsArabic(order.shipping_governorate) });
        currentBillY += 5;

        if (order.customer_email && order.promo_percentage < 100) {
            doc.text(`Email: ${order.customer_email}`, leftColX, currentBillY);
            currentBillY += 5;
        }
        if (order.phone_numbers && order.phone_numbers.length > 0) {
            order.phone_numbers.forEach((phone, index) => {
                doc.text(`Phone ${index + 1}: ${phone}`, leftColX, currentBillY);
                currentBillY += 5;
            });
        }


        // 3. Invoice Details (Right Column)
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("INVOICE DETAILS:", rightColX, startY);

        doc.setFontSize(10);
        const addDetailRow = (label: string, value: string, y: number) => {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(label, detailsLabelX, y);

            doc.setFont("helvetica", "bold");
            doc.text(value, detailsValueX, y, { align: "right" });
        };

        let currentDetailY = startY + 6;
        addDetailRow(`Invoice Number:`, `INV-${order.order_id}`, currentDetailY);
        currentDetailY += 5;
        addDetailRow(`Order Date:`, new Date(order.order_date).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'), currentDetailY);
        currentDetailY += 5;
        addDetailRow(`Payment Method:`, order.payment_method || "COD", currentDetailY);
        currentDetailY += 5;
        addDetailRow(`Order ID:`, `#${order.order_id}`, currentDetailY);


        // --- Items Table ---
        const tableStartY = Math.max(currentBillY, currentDetailY) + 10;

        const bundleMeta = order.bundle_metadata?.[0];
        const bundleProductIds: number[] = (bundleMeta as any)?.product_ids || [];
        const rawBundleName = bundleMeta?.raw_name || bundleMeta?.name || '';
        const parenMatch = rawBundleName.match(/\(([^)]+)\)/);
        const bundleProductNames: string[] = parenMatch
            ? parenMatch[1].split('+').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
            : [];

        let bundleItems: typeof order.items = [];
        let regularItems: typeof order.items = [];

        order.items.forEach(subItem => {
            const itemNameLower = (subItem.item_name || '').toLowerCase();
            const prodBaseLower = (subItem.product_base_name || '').toLowerCase();
            const varNameLower = (subItem.variant_name || '').toLowerCase();

            const isExplicitBundleItem = bundleProductIds.length > 0 && !!subItem.product_id && bundleProductIds.includes(subItem.product_id);
            const isNameMatched = bundleProductNames.length > 0 && bundleProductNames.some(bp =>
                bp.includes(itemNameLower) || itemNameLower.includes(bp) ||
                (prodBaseLower && (bp.includes(prodBaseLower) || prodBaseLower.includes(bp))) ||
                (varNameLower && (bp.includes(varNameLower) || varNameLower.includes(bp)))
            );

            const isBundleItem = isExplicitBundleItem || isNameMatched;
            const bundleCount = bundleMeta?.item_count || 0;

            if (isBundleItem && (!bundleCount || bundleItems.length < bundleCount)) {
                bundleItems.push(subItem);
            } else {
                regularItems.push(subItem);
            }
        });

        const bundleCount = bundleMeta?.item_count || 0;
        if (bundleItems.length === 0 && bundleCount > 0 && bundleCount <= order.items.length) {
            bundleItems = order.items.slice(0, bundleCount);
            regularItems = order.items.slice(bundleCount);
        }

        const isBundleOrder = !!(bundleMeta && bundleItems.length > 0);

        let tableBody: any[] = [];
        const bundleRowIndices = new Set<number>();

        if (isBundleOrder) {
            let primaryBundleName = bundleMeta?.name || rawBundleName;
            if (!primaryBundleName || primaryBundleName === "Body Lotion Collection") {
                const extracted = bundleItems.find(i => i.item_name.includes(' - '))?.item_name.split(' - ')[0].trim();
                if (extracted && extracted !== "Body Lotion Collection") {
                    primaryBundleName = extracted;
                } else {
                    primaryBundleName = "Summer Bundle";
                }
            }
            primaryBundleName = primaryBundleName.replace(/\s*\([^)]+\)$/, '').trim();

            const totalFinal = bundleItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
            const totalOriginal = bundleItems.reduce((sum, i) => sum + (i.quantity * (i.unit_price + (i.item_discount_per_unit || 0))), 0);
            let bundleDiscount = (order.bundle_metadata || []).reduce((s: number, b: any) => s + (b.total_discount || 0), 0);
            if (bundleDiscount === 0 && totalOriginal > totalFinal) {
                bundleDiscount = Math.round((totalOriginal - totalFinal) * 100) / 100;
            }

            // Sub-items for bundle: prioritize actual bundle items with explicit variants
            let expandedSubItems: string[] = [];
            if (bundleItems.length > 0) {
                bundleItems.forEach(subItem => {
                    const subName = subItem.item_name || (
                        subItem.variant_name && subItem.variant_name.trim()
                            ? `${subItem.product_base_name || ''} - ${subItem.variant_name.trim()}`.trim()
                            : subItem.product_base_name || 'Item'
                    );
                    for (let r = 0; r < subItem.quantity; r++) expandedSubItems.push(subName);
                });
            } else {
                const matchInParen = rawBundleName.match(/\(([^)]+)\)/);
                if (matchInParen && matchInParen[1].includes('+')) {
                    expandedSubItems = matchInParen[1].split('+').map(s => s.trim());
                }
            }

            // 1. Bundle Header Row (with bundle discount label if present)
            const bundleLabel = bundleDiscount > 0
                ? `[Bundle] ${primaryBundleName} (Saved ${formatCurrency(bundleDiscount)})`
                : `[Bundle] ${primaryBundleName}`;

            const bundleHeaderRow = [
                {
                    content: bundleLabel,
                    styles: {
                        fontStyle: 'bold' as const,
                        textColor: [20, 120, 80],
                        font: containsArabic(bundleLabel) ? 'NotoSansArabic-Regular' : 'helvetica'
                    }
                },
                { content: '1', styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
                { content: formatCurrency(totalFinal), styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
                { content: formatCurrency(totalFinal), styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
            ];

            // 2. Bundle Sub-item Rows
            const subItemRows = expandedSubItems.map(subName => [
                {
                    content: `   • ${subName}`,
                    styles: {
                        fontSize: 9,
                        textColor: [80, 80, 80],
                        font: containsArabic(subName) ? 'NotoSansArabic-Regular' : 'helvetica'
                    }
                },
                { content: '', styles: { halign: 'center' as const } },
                { content: '', styles: { halign: 'right' as const } },
                { content: '', styles: { halign: 'right' as const } }
            ]);

            // 3. Regular Standalone Product Rows
            const regularItemRows = regularItems.map(subItem => {
                const displayName = subItem.item_name || (
                    subItem.variant_name && subItem.variant_name.trim()
                        ? `${subItem.product_base_name || ''} - ${subItem.variant_name.trim()}`.trim()
                        : subItem.product_base_name || 'Item'
                );

                return [
                    {
                        content: displayName,
                        styles: {
                            fontSize: 10,
                            textColor: [50, 50, 50],
                            font: containsArabic(displayName) ? 'NotoSansArabic-Regular' : 'helvetica'
                        }
                    },
                    { content: subItem.quantity.toString(), styles: { halign: 'center' as const } },
                    { content: formatCurrency(subItem.unit_price), styles: { halign: 'right' as const } },
                    { content: formatCurrency(subItem.quantity * subItem.unit_price), styles: { halign: 'right' as const } }
                ];
            });

            tableBody = [
                bundleHeaderRow,
                ...subItemRows,
                ...regularItemRows
            ];

            // Highlight bundle header and sub-items
            const totalBundleRows = 1 + subItemRows.length;
            for (let r = 0; r < totalBundleRows; r++) {
                bundleRowIndices.add(r);
            }
        } else {
            tableBody = order.items.map(item => {
                const displayName = item.item_name || (
                    item.variant_name && item.variant_name.trim()
                        ? `${item.product_base_name || ''} - ${item.variant_name.trim()}`.trim()
                        : item.product_base_name || 'Item'
                );
                return [
                    displayName,
                    item.quantity.toString(),
                    formatCurrency(item.unit_price),
                    formatCurrency(item.quantity * item.unit_price)
                ];
            });
        }

        autoTable(doc, {
            startY: tableStartY,
            head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'plain',
            styles: {
                fillColor: [255, 255, 255],
                textColor: [80, 80, 80],
                fontSize: 9,
                cellPadding: 2.2,
                lineColor: [220, 220, 220],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [245, 240, 235],
                textColor: [50, 50, 50],
                fontStyle: 'bold',
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            alternateRowStyles: {},
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' },
            },
            margin: { left: 15, right: 15 },
            didParseCell: (data) => {
                if (data.section !== 'body') return;
                const cellText = Array.isArray(data.cell.text) ? data.cell.text.join(' ') : String(data.cell.text || '');
                if (containsArabic(cellText)) {
                    data.cell.styles.font = 'NotoSansArabic-Regular';
                }
                if (bundleRowIndices.has(data.row.index)) {
                    // Bundle rows: distinct light green tint background + clear grid lines
                    data.cell.styles.fillColor = [245, 252, 248];
                    data.cell.styles.lineColor = [215, 230, 222];
                    data.cell.styles.lineWidth = 0.1;
                } else {
                    // Regular standalone products outside bundle: white background + standard grid lines
                    data.cell.styles.fillColor = [255, 255, 255];
                    data.cell.styles.lineColor = [220, 220, 220];
                    data.cell.styles.lineWidth = 0.1;
                }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && bundleRowIndices.has(data.row.index)) {
                    // Draw a strong green accent border on the left edge of bundle rows to clearly frame the bundle block
                    if (data.column.index === 0) {
                        doc.setDrawColor(20, 120, 80);
                        doc.setLineWidth(1.2);
                        doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                    }
                }
            }
        });

        // --- Totals ---
        const finalY = doc.lastAutoTable.finalY + 8;
        const totalXLabel = pageWidth - 105;
        const totalXValue = pageWidth - 15;

        const addTotalRow = (label: string, value: string, y: number, bold = false, size = 10, color = [0, 0, 0]) => {
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setFontSize(size);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(label, totalXLabel, y, { align: "left" });
            doc.text(value, totalXValue, y, { align: "right" });
        };

        let currentTotalY = finalY;

        // Original subtotal before ALL discounts (unit_price is the pre-discount price)
        const totalFinalForCalc = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        const totalOriginalForCalc = order.items.reduce((sum, i) => sum + (i.quantity * (i.unit_price + (i.item_discount_per_unit || 0))), 0);
        const baseSubtotal = totalOriginalForCalc > 0 ? totalOriginalForCalc : ((order.subtotal && order.subtotal > 0) ? order.subtotal : totalFinalForCalc);

        // Bundle discount (from metadata or per-item discounts in DB view)
        const calcBundleDiscount = (order.bundle_metadata || []).reduce((s: number, b: any) => s + (b.total_discount || 0), 0)
            || order.items.reduce((sum, i) => sum + (i.quantity * (i.item_discount_per_unit || 0)), 0);

        // Promo / manual discount
        const promoDiscount = (order.applied_promo_codes && Array.isArray(order.applied_promo_codes))
            ? order.applied_promo_codes.reduce((sum: number, p: any) => sum + (p.discount || 0), 0)
            : (order.discount_total || 0);

        // Use grand_total from DB as the authoritative number so we capture ALL discounts
        // (bundle + promo + product-level). Derive the combined discount from it.
        const storedGrandTotal = (order as any).grand_total || order.final_order_total || 0;
        const combinedDiscount = storedGrandTotal > 0
            ? Math.max(0, baseSubtotal + order.shipping_total - storedGrandTotal)
            : calcBundleDiscount + promoDiscount;

        // 1. Subtotal (Original before discounts)
        addTotalRow("Subtotal:", formatCurrency(baseSubtotal), currentTotalY);
        currentTotalY += 5;

        // 2. Combined Total Discount row
        if (combinedDiscount > 0) {
            addTotalRow("Total Discount:", `-${formatCurrency(combinedDiscount)}`, currentTotalY, false, 9, [20, 120, 80]);
            currentTotalY += 5;
        }

        // 3. Shipping
        addTotalRow("Shipping:", order.shipping_total > 0 ? formatCurrency(order.shipping_total) : "Free", currentTotalY);
        currentTotalY += 5;

        // 4. Grand Total line
        doc.setDrawColor(200, 200, 200);
        doc.line(totalXLabel, currentTotalY, totalXValue, currentTotalY);
        currentTotalY += 5;

        const grandTotal = storedGrandTotal > 0 ? storedGrandTotal : Math.max(0, baseSubtotal - combinedDiscount + order.shipping_total);
        addTotalRow("TOTAL:", formatCurrency(grandTotal), currentTotalY, true, 11, [100, 80, 60]);
        currentTotalY += 5;

        // --- Footer (Thank You Message) ---
        // Dynamically position footer well below totals to prevent overlap
        const footerY = Math.max(currentTotalY + 15, pageHeight - 25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);

        doc.text("Thank you for choosing Nature Hug! We hope our products bring you pure glow.", pageWidth / 2, footerY, { align: "center" });
        doc.text("Follow us on instagram @Nature.Hug_NM for tips & new arrivals!", pageWidth / 2, footerY + 4, { align: "center" });

        doc.setDrawColor(220, 220, 220);
        doc.line(pageWidth / 2 - 40, footerY + 7, pageWidth / 2 + 40, footerY + 7);

        doc.setFontSize(8);
        doc.text("For help and customer service call 01090998664", pageWidth / 2, footerY + 11, { align: "center" });

        // Outer border removed for cleaner look
    });

    // Save
    const fileName = Array.isArray(orders) && orders.length > 1
        ? `invoices_bulk_${orders[0].order_id + "_" + orders[orders.length - 1].order_id}.pdf`
        : `invoice_${orders instanceof Array ? orders[0].order_id : orders.order_id}.pdf`;

    doc.save(fileName);
};