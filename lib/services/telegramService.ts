// Telegram Bot Notification Service
// Simple, reliable notifications using Telegram Bot API

interface TelegramResponse {
    ok: boolean;
    result?: any;
    description?: string;
}

interface TelegramOrderItem {
    name: string;
    quantity: number;
    price: number;              // final unit price (after discount)
    originalPrice?: number;    // unit price before discount (for bundles)
    isBundle?: boolean;
    bundleSubItems?: { name: string; quantity: number }[];
    variantName?: string;      // selected variant name for regular products (legacy, name may already include it)
}

interface OrderNotificationData {
    orderId: number;
    customerName: string;
    totalAmount: number;
    phone?: string | null;
    governorate?: string | null;
    address?: string | null;
    items?: TelegramOrderItem[];
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Support multiple chat IDs separated by comma
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_ID?.split(',').map(id => id.trim()) || [];

/**
 * Send a message to a single chat ID
 */
async function sendToChat(chatId: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data: TelegramResponse = await response.json();

        if (data.ok) {
            console.log(`[Telegram] Message sent to ${chatId}`);
            return { success: true };
        } else {
            console.error(`[Telegram] Failed to send to ${chatId}:`, data.description);
            return { success: false, error: data.description };
        }
    } catch (error: any) {
        console.error(`[Telegram] Error sending to ${chatId}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a message to ALL registered chat IDs
 */
export async function sendTelegramMessage(message: string): Promise<{ success: boolean; error?: string; sent?: number; failed?: number }> {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_CHAT_IDS.length === 0) {
        console.error('[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return { success: false, error: 'Missing Telegram configuration' };
    }

    let sent = 0;
    let failed = 0;

    // Send to all chat IDs
    const results = await Promise.allSettled(
        TELEGRAM_CHAT_IDS.map(chatId => sendToChat(chatId, message))
    );

    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
            sent++;
        } else {
            failed++;
        }
    });

    console.log(`[Telegram] Sent: ${sent}, Failed: ${failed}`);
    return { success: sent > 0, sent, failed };
}

/**
 * Send order notification to Telegram with full details
 */
export async function sendOrderNotificationTelegram(
    data: OrderNotificationData & {
        subtotal?: number;
        discountTotal?: number;
        shippingTotal?: number;
        bundleDiscountTotal?: number;  // bundle discount shown separately for transparency
    }
): Promise<{ success: boolean; error?: string; sent?: number; failed?: number }> {
    // Build items list
    let itemsList = '';
    if (data.items && data.items.length > 0) {
        itemsList = data.items.map((item, i) => {
            if (item.isBundle) {
                // Bundle: show name, sub-items, price before/after discount
                const finalTotal = (item.price * item.quantity).toFixed(2);
                const originalTotal = item.originalPrice ? (item.originalPrice * item.quantity).toFixed(2) : null;
                const discountAmount = item.originalPrice ? ((item.originalPrice - item.price) * item.quantity).toFixed(2) : null;

                let bundleLine = `   ${i + 1}. 🎁 <b>${item.name}</b> × ${item.quantity}`;
                if (originalTotal && discountAmount && parseFloat(discountAmount) > 0) {
                    bundleLine += `\n       💵 قبل الخصم: <s>${originalTotal} ج.م</s>`;
                    bundleLine += `\n       🏷️ الخصم: -${discountAmount} ج.م`;
                    bundleLine += `\n       ✅ بعد الخصم: <b>${finalTotal} ج.م</b>`;
                } else {
                    bundleLine += ` = ${finalTotal} ج.م`;
                }

                if (item.bundleSubItems && item.bundleSubItems.length > 0) {
                    const subList = item.bundleSubItems
                        .map(sub => `         • ${sub.name} × ${sub.quantity}`)
                        .join('\n');
                    bundleLine += `\n       📋 المنتجات:\n${subList}`;
                }

                return bundleLine;
            } else {
                return `   ${i + 1}. ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ج.م`;
            }
        }).join('\n');
    }

    // Build price breakdown — single combined discount line
    // subtotal passed in = items at their final (post-bundle) prices
    // bundleDiscountTotal = the bundle saving; discountTotal = promo code saving
    const totalDiscount = (data.bundleDiscountTotal || 0) + (data.discountTotal || 0);
    const originalSubtotal = (data.subtotal || 0) + (data.bundleDiscountTotal || 0);

    let priceBreakdown = '';
    if (originalSubtotal > 0) {
        priceBreakdown += `\n💵 <b>المجموع قبل الخصم:</b> ${originalSubtotal.toFixed(2)} ج.م`;
    }
    if (totalDiscount > 0) {
        priceBreakdown += `\n🏷️ <b>إجمالي الخصم:</b> -${totalDiscount.toFixed(2)} ج.م`;
    }
    if (data.shippingTotal !== undefined && data.shippingTotal > 0) {
        priceBreakdown += `\n🚚 <b>الشحن:</b> ${data.shippingTotal.toFixed(2)} ج.م`;
    }

    const message = `
🛒 <b>طلب جديد!</b>

📋 <b>رقم الطلب:</b> #${data.orderId}
👤 <b>العميل:</b> ${data.customerName}
📞 <b>الهاتف:</b> ${data.phone || 'غير متاح'}
📍 <b>المحافظة:</b> ${data.governorate || 'غير محدد'}
🏠 <b>العنوان:</b> ${data.address || 'غير متاح'}

📦 <b>المنتجات:</b>
${itemsList || '   لا توجد تفاصيل'}
${priceBreakdown}
💰 <b>الإجمالي النهائي:</b> ${data.totalAmount.toFixed(2)} ج.م

🔗 <a href="https://www.naturehug.shop/admin/orders/${data.orderId}">عرض الطلب</a>
    `.trim();

    return sendTelegramMessage(message);
}
