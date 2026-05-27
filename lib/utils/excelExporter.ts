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

export const exportCustomersToExcel = (orders: OrderDetailsView[]) => {
    // Build unique customer map (keyed by customer_name to deduplicate)
    const customerMap = new Map<string, {
        name: string;
        phones: Set<string>;
        email: string;
        governorate: string;
        address: string;
        totalOrders: number;
        totalSpent: number;
    }>();

    orders.forEach(order => {
        const key = order.customer_name?.trim() || 'Unknown';
        const existing = customerMap.get(key);

        if (existing) {
            existing.totalOrders += 1;
            existing.totalSpent += order.final_order_total || 0;
            // Merge phone numbers
            order.phone_numbers?.forEach(p => existing.phones.add(p));
            // Use latest address/governorate if available
            if (order.shipping_governorate) existing.governorate = order.shipping_governorate;
            if (order.shipping_street_address) existing.address = order.shipping_street_address;
            if (order.customer_email) existing.email = order.customer_email;
        } else {
            customerMap.set(key, {
                name: key,
                phones: new Set(order.phone_numbers || []),
                email: order.customer_email || '',
                governorate: order.shipping_governorate || '',
                address: order.shipping_street_address || '',
                totalOrders: 1,
                totalSpent: order.final_order_total || 0,
            });
        }
    });

    // Convert to flat array
    const data = Array.from(customerMap.values()).map(c => ({
        'Customer Name': c.name,
        'Phone Numbers': Array.from(c.phones).join(', '),
        'Email': c.email,
        'Governorate': c.governorate,
        'Address': c.address,
        'Total Orders': c.totalOrders,
        'Total Spent': Math.round(c.totalSpent * 100) / 100,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
        { wch: 25 }, // Customer Name
        { wch: 25 }, // Phone Numbers
        { wch: 25 }, // Email
        { wch: 15 }, // Governorate
        { wch: 35 }, // Address
        { wch: 12 }, // Total Orders
        { wch: 12 }, // Total Spent
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `customers_export_${dateStr}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, fileName);
};
