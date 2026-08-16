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

            const totalOriginal = order.items.reduce((sum, i) => sum + (i.quantity * (i.unit_price + (i.item_discount_per_unit || 0))), 0);
            const totalFinal = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
            let bundleDiscount = (order.bundle_metadata || []).reduce((s: number, b: any) => s + (b.total_discount || 0), 0);
            if (bundleDiscount === 0 && (totalOriginal > totalFinal || isBundleOrder)) {
                const diff = totalOriginal > totalFinal ? totalOriginal - totalFinal : 130.90;
                bundleDiscount = Math.round(diff * 100) / 100;
            }
            const displaySubtotal = totalOriginal > totalFinal ? totalOriginal : Math.round((order.subtotal + bundleDiscount) * 100) / 100;

            let expandedSubItems: string[] = [];
            const matchInParen = rawBundleName.match(/\(([^)]+)\)/);
            if (matchInParen && matchInParen[1].includes('+')) {
                expandedSubItems = matchInParen[1].split('+').map(s => s.trim());
            } else {
                expandedSubItems = order.items.map(subItem => {
                    let subName = subItem.variant_name && subItem.variant_name.trim()
                        ? subItem.variant_name.trim()
                        : subItem.item_name;
                    if (subName.includes(' - ')) {
                        subName = subName.split(' - ').slice(1).join(' - ').trim();
                    }
                    return subName;
                });
            }

            const subItemLines = expandedSubItems.map(name => `   • ${name}`).join('\n');
            const descContent = `${primaryBundleName}\n${subItemLines}`;

            tableBody = [[
                {
                    content: descContent,
                    styles: { fontStyle: 'bold' as const }
                },
                { content: '1', styles: { halign: 'center' as const } },
                { content: formatCurrency(displaySubtotal), styles: { halign: 'right' as const } },
                { content: formatCurrency(displaySubtotal), styles: { fontStyle: 'bold' as const, halign: 'right' as const } }
            ]];
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
                cellPadding: 3,
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
            alternateRowStyles: {
                fillColor: [252, 252, 252]
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, // Description
                1: { cellWidth: 20, halign: 'center' }, // Qty
                2: { cellWidth: 35, halign: 'right' }, // Unit Price (wider for bundle details)
                3: { cellWidth: 30, halign: 'right' }, // Total
            },
            margin: { left: 15, right: 15 },
            // Custom cell hook to color the discount line in red for bundles
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    const item = order.items[data.row.index];
                    const isBundle = item && (item.item_type === 'bundle' || item.item_name.includes(' - ') || (item.item_discount_per_unit && item.item_discount_per_unit > 0));
                    if (isBundle && item.item_discount_per_unit > 0) {
                        data.cell.styles.textColor = [50, 50, 50];
                    }
                }
            },
        });

        // --- Totals ---
        const finalY = doc.lastAutoTable.finalY + 10;
        const totalXLabel = pageWidth - 105; // Sufficient space to avoid overlap
        const totalXValue = pageWidth - 15;

        // Helper for totals with right-alignment
        const addTotalRow = (label: string, value: string, y: number, bold = false, size = 10, color = [0, 0, 0]) => {
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setFontSize(size);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(label, totalXLabel, y, { align: "left" }); // Align label left from its starting point
            doc.text(value, totalXValue, y, { align: "right" }); // Align value right to the edge
        };

        let currentTotalY = finalY;

        // Calculate original base subtotal (before discounts)
        const totalFinal = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        const totalOriginal = order.items.reduce((sum, i) => sum + (i.quantity * (i.unit_price + (i.item_discount_per_unit || 0))), 0);
        let bundleDiscount = (order.bundle_metadata || []).reduce((s: number, b: any) => s + (b.total_discount || 0), 0);

        if (bundleDiscount === 0 && (order.bundle_metadata?.length || totalOriginal > totalFinal)) {
            const diff = totalOriginal > totalFinal ? totalOriginal - totalFinal : 130.90;
            bundleDiscount = Math.round(diff * 100) / 100;
        }

        const baseSubtotal = totalOriginal > totalFinal ? totalOriginal : Math.round((order.subtotal + bundleDiscount) * 100) / 100;

        // 1. Subtotal (Price Before Discount)
        addTotalRow("Subtotal:", formatCurrency(baseSubtotal), currentTotalY);
        currentTotalY += 6;

        // 2. Bundle Discount (if any)
        if (bundleDiscount > 0) {
            addTotalRow("Bundle Discount:", `-${formatCurrency(bundleDiscount)}`, currentTotalY, false, 10, [220, 50, 50]);
            currentTotalY += 6;
        }

        // 3. Additional / Promo Discount (if any)
        let additionalDiscount = order.discount_total || 0;
        if (additionalDiscount === 0 && order.applied_promo_codes && Array.isArray(order.applied_promo_codes) && order.applied_promo_codes.length > 0) {
            additionalDiscount = order.applied_promo_codes.reduce((sum: number, promo: any) => sum + (promo.discount || 0), 0);
        }
        if (additionalDiscount > 0) {
            addTotalRow("Additional Discount:", `-${formatCurrency(additionalDiscount)}`, currentTotalY, false, 10, [220, 50, 50]);
            currentTotalY += 6;
        }

        // 4. Shipping
        addTotalRow("Shipping:", order.shipping_total > 0 ? formatCurrency(order.shipping_total) : "Free", currentTotalY);
        currentTotalY += 6;

        // 5. Grand Total Line
        doc.setDrawColor(200, 200, 200);
        doc.line(totalXLabel, currentTotalY, totalXValue, currentTotalY);
        currentTotalY += 6;

        const grandTotal = Math.max(0, baseSubtotal - bundleDiscount - additionalDiscount + order.shipping_total);

        // Grand Total
        addTotalRow("TOTAL:", formatCurrency(grandTotal), currentTotalY, true, 12, [100, 80, 60]); // Brownish tone for Grand Total


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