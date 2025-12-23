import * as XLSX from 'xlsx';
import { OrderDetailsView } from '@/domain/entities/views/admin/orderDetailsView';

export const exportOrdersToExcel = (orders: OrderDetailsView[]) => {
    // Transform data to flat structure
    const data = orders.map(order => {
        // Create items summary string
        const itemsSummary = order.items.map(item => {
            return `${item.item_name} x${item.quantity}`;
        }).join('\n');

        return {
            'Order ID': order.order_id,
            'Status': order.order_status,
            'Date': new Date(order.order_date).toLocaleDateString(),
            'Customer Name': order.customer_name,
            'Phone Numbers': order.phone_numbers?.join(', ') || '',
            'Governorate': order.shipping_governorate,
            'Address': order.shipping_street_address,
            'Payment Method': order.payment_method,
            'Payment Status': order.payment_status,
            'Items': itemsSummary,
            'Subtotal': order.subtotal,
            'Shipping Cost': order.shipping_total,
            'Discount': order.discount_total,
            'Grand Total': order.final_order_total,
            'Promo Code': order.applied_promo_code || '',
            'AWB': order.awb || ''
        };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths (optional but good for UX)
    const colWidths = [
        { wch: 10 }, // Order ID
        { wch: 15 }, // Status
        { wch: 15 }, // Date
        { wch: 20 }, // Customer Name
        { wch: 20 }, // Phone Numbers
        { wch: 15 }, // Governorate
        { wch: 30 }, // Address
        { wch: 15 }, // Payment Method
        { wch: 15 }, // Payment Status
        { wch: 50 }, // Items
        { wch: 10 }, // Subtotal
        { wch: 10 }, // Shipping
        { wch: 10 }, // Discount
        { wch: 10 }, // Total
        { wch: 15 }, // Promo Code
        { wch: 20 }, // AWB
    ];
    worksheet['!cols'] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `orders_export_${dateStr}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, fileName);
};
