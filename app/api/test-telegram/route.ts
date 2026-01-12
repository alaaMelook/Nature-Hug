import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotificationTelegram, sendTelegramMessage } from "@/lib/services/telegramService";

export async function GET(request: NextRequest) {
    try {
        // Test order notification with full details
        const orderResult = await sendOrderNotificationTelegram({
            orderId: 9999,
            customerName: "عميل تجريبي",
            totalAmount: 355.00,
            phone: "01234567890",
            governorate: "القاهرة",
            address: "123 شارع التحرير، المعادي",
            items: [
                { name: "Lavender Body Lotion", quantity: 2, price: 120 },
                { name: "Rose Face Cream", quantity: 1, price: 85 }
            ]
        });

        return NextResponse.json({
            success: true,
            orderNotification: orderResult,
            message: "Check your Telegram! 📲"
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
