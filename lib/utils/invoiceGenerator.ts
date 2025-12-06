import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";

// NOTE ON LOGO: The provided code uses a URL. To use your uploaded logo (logo (4).png)
// you must first convert it to a Base64 string and replace 'YOUR_BASE64_LOGO_STRING_HERE' below.
// For example: doc.addImage(base64ImageString, 'PNG', ...)

const formatCurrency = (amount: number) => {
    // Assuming EGP from your original code, can be changed.
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(amount);
};

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
        const logoUrl = "https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/public/product-images/logo%20(4).png"; // <<< REPLACE THIS LINE
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
        doc.text(order.customer_name || "Customer Name", leftColX, currentBillY);

        const addressLines = doc.splitTextToSize(`${order.shipping_street_address}, ${order.shipping_governorate}`, (pageWidth / 2) - leftColX - 5);
        currentBillY += 5;
        doc.text(addressLines, leftColX, currentBillY);
        currentBillY += (addressLines.length * 5) + 2;

        if (order.customer_email) {
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

        const tableBody = order.items.map(item => [
            item.item_name,
            item.quantity,
            formatCurrency(item.unit_price),
            formatCurrency(item.quantity * item.unit_price)
        ]);

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
                fillColor: [245, 240, 235], // Light beige for header
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
                2: { cellWidth: 30, halign: 'right' }, // Unit Price
                3: { cellWidth: 30, halign: 'right' }, // Total
            },
            margin: { left: 15, right: 15 },

        });

        // --- Totals ---
        const finalY = doc.lastAutoTable.finalY + 10;
        const totalXLabel = pageWidth - 65; // Pull label in
        const totalXValue = pageWidth - 15;

        // Tax calculation placeholder (5% from image)
        const taxRate = 0.05;
        const taxAmount = (order.subtotal || 0) * taxRate; // Simple calculation

        // Helper for totals with right-alignment
        const addTotalRow = (label: string, value: string, y: number, bold = false, size = 10, color = [0, 0, 0]) => {
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setFontSize(size);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(label, totalXLabel, y, { align: "left" }); // Align label left from its starting point
            doc.text(value, totalXValue, y, { align: "right" }); // Align value right to the edge
        };

        let currentTotalY = finalY;

        addTotalRow("Subtotal:", formatCurrency(order.subtotal), currentTotalY);
        currentTotalY += 6;
        addTotalRow("Shipping:", order.shipping_total > 0 ? formatCurrency(order.shipping_total) : "Free", currentTotalY);
        currentTotalY += 6;

        // Grand Total Line (Stronger separator)
        doc.setDrawColor(200, 200, 200);
        doc.line(totalXLabel, currentTotalY, totalXValue, currentTotalY);
        currentTotalY += 6;

        // Grand Total
        addTotalRow("TOTAL:", formatCurrency(order.final_order_total), currentTotalY, true, 12, [100, 80, 60]); // Brownish tone for Grand Total


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