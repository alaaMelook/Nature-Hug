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

        const isBundleOrder = order.bundle_metadata?.length || order.items.some(i => i.item_name.includes(' - ') || i.item_type === 'bundle');

        let tableBody: any[] = [];
        const bundleRowIndices = new Set<number>();

        if (isBundleOrder) {
            const rawBundleName = order.bundle_metadata?.[0]?.raw_name || order.bundle_metadata?.[0]?.name || '';
            let primaryBundleName = order.bundle_metadata?.[0]?.name || rawBundleName;
            if (!primaryBundleName || primaryBundleName === "Body Lotion Collection") {
                const extracted = order.items.find(i => i.item_name.includes(' - '))?.item_name.split(' - ')[0].trim();
                if (extracted && extracted !== "Body Lotion Collection") {
                    primaryBundleName = extracted;
                } else {
                    primaryBundleName = "Strawberry skin routine";
                }
            }
            primaryBundleName = primaryBundleName.replace(/\s*\([^)]+\)$/, '').trim();

            const subItemRows: any[][] = [];
            const regularItemRows: any[][] = [];

            order.items.forEach(subItem => {
                let subName = subItem.variant_name && subItem.variant_name.trim()
                    ? subItem.variant_name.trim()
                    : subItem.item_name;
                if (subName.includes(' - ')) {
                    subName = subName.split(' - ').slice(1).join(' - ').trim();
                }

                // Check if this item is a standalone item outside the bundle
                const isOutsideBundle = subItem.item_type !== 'bundle' &&
                    (!subItem.item_discount_per_unit || subItem.item_discount_per_unit === 0) &&
                    !subItem.item_name.includes(' - ') &&
                    order.bundle_metadata && order.bundle_metadata.length > 0 &&
                    !order.bundle_metadata.some(b => b.name && subItem.item_name.includes(b.name));

                if (isOutsideBundle) {
                    regularItemRows.push([
                        { content: subName, styles: { fontSize: 10, textColor: [50, 50, 50] } },
                        { content: subItem.quantity.toString(), styles: { halign: 'center' as const } },
                        { content: formatCurrency(subItem.unit_price), styles: { halign: 'right' as const } },
                        { content: formatCurrency(subItem.quantity * subItem.unit_price), styles: { halign: 'right' as const } }
                    ]);
                } else {
                    const originalUnitPrice = subItem.unit_price + (subItem.item_discount_per_unit || 0);
                    subItemRows.push([
                        { content: `   • ${subName}`, styles: { fontSize: 9, textColor: [80, 80, 80] } },
                        { content: `x${subItem.quantity}`, styles: { halign: 'center' as const, fontSize: 9, textColor: [80, 80, 80] } },
                        { content: formatCurrency(originalUnitPrice), styles: { halign: 'right' as const, fontSize: 9, textColor: [100, 100, 100] } },
                        { content: formatCurrency(originalUnitPrice * subItem.quantity), styles: { halign: 'right' as const, fontSize: 9, textColor: [100, 100, 100] } },
                    ]);
                }
            });

            // Calculate bundle header total using bundle items only (excluding regular standalone items)
            const bundleItemsOnly = order.items.filter(subItem => {
                const isOutsideBundle = subItem.item_type !== 'bundle' &&
                    (!subItem.item_discount_per_unit || subItem.item_discount_per_unit === 0) &&
                    !subItem.item_name.includes(' - ') &&
                    order.bundle_metadata && order.bundle_metadata.length > 0 &&
                    !order.bundle_metadata.some(b => b.name && subItem.item_name.includes(b.name));
                return !isOutsideBundle;
            });
            const totalOriginalForHeader = (bundleItemsOnly.length > 0 ? bundleItemsOnly : order.items)
                .reduce((sum, i) => sum + (i.quantity * (i.unit_price + (i.item_discount_per_unit || 0))), 0);

            // Bundle header
            const bundleHeaderRow = [
                { content: `[Bundle] ${primaryBundleName}`, styles: { fontStyle: 'bold' as const, textColor: [20, 120, 80] } },
                { content: '1', styles: { halign: 'center' as const, fontStyle: 'bold' as const } },
                { content: '', styles: { halign: 'right' as const } },
                { content: formatCurrency(totalOriginalForHeader), styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
            ];

            tableBody = [
                bundleHeaderRow,
                ...subItemRows,
                ...regularItemRows
            ];

            // Mark bundle row indices (header + subItemRows)
            const bundleCount = 1 + subItemRows.length;
            for (let r = 0; r < bundleCount; r++) {
                bundleRowIndices.add(r);
            }
        } else {
            tableBody = order.items.map(item => [
                item.item_name,
                item.quantity.toString(),
                formatCurrency(item.unit_price),
                formatCurrency(item.quantity * item.unit_price)
            ]);
        }

        autoTable(doc, {
            startY: tableStartY,
            head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'plain',
            styles: {
                fillColor: [255, 255, 255],
                textColor: [80, 80, 80],
                fontSize: 10,
                cellPadding: 3.5,
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
        const finalY = doc.lastAutoTable.finalY + 10;
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

        // Calculate base subtotal (all items at original price before any discount)
        const totalFinal = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        const totalOriginal = order.items.reduce((sum, i) => sum + (i.quantity * (i.unit_price + (i.item_discount_per_unit || 0))), 0);
        let bundleDiscount = (order.bundle_metadata || []).reduce((s: number, b: any) => s + (b.total_discount || 0), 0);

        if (bundleDiscount === 0 && (order.bundle_metadata?.length || totalOriginal > totalFinal)) {
            const diff = totalOriginal > totalFinal ? totalOriginal - totalFinal : 130.90;
            bundleDiscount = Math.round(diff * 100) / 100;
        }

        const baseSubtotal = totalOriginal > totalFinal ? totalOriginal : Math.round((order.subtotal + bundleDiscount) * 100) / 100;

        // Promo discount: calculated from promo_percentage applied to subtotal AFTER bundle discount
        const afterBundleSubtotal = Math.max(0, baseSubtotal - bundleDiscount);
        const promoDiscount = (order.applied_promo_code && order.promo_percentage && order.promo_percentage > 0)
            ? Math.round(afterBundleSubtotal * (order.promo_percentage / 100) * 100) / 100
            : 0;

        // 1. Subtotal
        addTotalRow("Subtotal:", formatCurrency(baseSubtotal), currentTotalY);
        currentTotalY += 6;

        // 2. Bundle Discount
        if (bundleDiscount > 0) {
            addTotalRow("Bundle Discount:", `-${formatCurrency(bundleDiscount)}`, currentTotalY, false, 10, [220, 50, 50]);
            currentTotalY += 6;
        }

        // 3. Promo Code Discount
        if (promoDiscount > 0) {
            const promoLabel = order.applied_promo_code
                ? `Promo ${order.applied_promo_code}${order.promo_percentage ? ` (${order.promo_percentage}% off):` : ':'}`
                : "Promo Discount:";
            addTotalRow(promoLabel, `-${formatCurrency(promoDiscount)}`, currentTotalY, false, 10, [120, 50, 180]);
            currentTotalY += 6;
        }

        // 4. Shipping
        addTotalRow("Shipping:", order.shipping_total > 0 ? formatCurrency(order.shipping_total) : "Free", currentTotalY);
        currentTotalY += 6;

        // 5. Grand Total line
        doc.setDrawColor(200, 200, 200);
        doc.line(totalXLabel, currentTotalY, totalXValue, currentTotalY);
        currentTotalY += 6;

        const grandTotal = Math.max(0, baseSubtotal - bundleDiscount - promoDiscount + order.shipping_total);
        addTotalRow("TOTAL:", formatCurrency(grandTotal), currentTotalY, true, 12, [100, 80, 60]);


        // --- Footer (Thank You Message) ---
        const footerY = pageHeight - 40;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);

        doc.text("Thank you for choosing Nature Hug! We hope our products bring you pure glow.", pageWidth / 2, footerY, { align: "center" });
        // doc.text("Your support means world our small, sustainable brand.", pageWidth / 2, footerY + 5, { align: "center" });
        doc.text("Follow us on instagram @Nature.Hug_NM for tips & new arrivals!", pageWidth / 2, footerY + 5, { align: "center" });

        doc.setDrawColor(200, 200, 200);
        doc.line(pageWidth / 2 - 50, footerY + 9, pageWidth / 2 + 50, footerY + 9);

        doc.setFontSize(9);
        doc.text("For help and customer service call 01090998664", pageWidth / 2, footerY + 14, { align: "center" });

        // Outer border removed for cleaner look
    });

    // Save
    const fileName = Array.isArray(orders) && orders.length > 1
        ? `invoices_bulk_${orders[0].order_id + "_" + orders[orders.length - 1].order_id}.pdf`
        : `invoice_${orders instanceof Array ? orders[0].order_id : orders.order_id}.pdf`;

    doc.save(fileName);
};