// Firebase Cloud Messaging Service
// Handles sending push notifications to registered devices using Firebase Admin SDK

import * as admin from 'firebase-admin';

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

interface FCMResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Initialize Firebase Admin SDK (singleton)
function getFirebaseAdmin(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    // Check if we have a service account key as JSON string
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountJson) {
        try {
            const serviceAccount = JSON.parse(serviceAccountJson);
            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } catch (error) {
            console.error('[FCM] Failed to parse service account JSON:', error);
        }
    }

    // Fallback: Initialize with project ID only (for testing)
    // This won't work for sending messages but allows the app to start
    console.warn('[FCM] No service account configured. Push notifications will not work.');
    return admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

/**
 * Send a push notification using Firebase Cloud Messaging HTTP v1 API
 * This function should be called from server-side code only
 */
export async function sendPushNotification(
    token: string,
    notification: NotificationPayload
): Promise<FCMResponse> {
    try {
        const app = getFirebaseAdmin();
        const messaging = admin.messaging(app);

        const message: admin.messaging.Message = {
            token: token,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            webpush: {
                notification: {
                    icon: '/email_verify.png',
                    badge: '/email_verify.png',
                    requireInteraction: true,
                    // Enable vibration for mobile
                    vibrate: [200, 100, 200, 100, 200] as any,
                    // Don't make it silent
                    silent: false,
                    renotify: true,
                    tag: 'order-notification',
                },
                fcmOptions: {
                    link: notification.data?.url || '/admin/orders',
                },
            },
            // Android specific settings for sound
            android: {
                notification: {
                    sound: 'default',
                    priority: 'high' as const,
                    channelId: 'orders',
                },
                priority: 'high' as const,
            },
            // APNs (iOS) specific settings for sound
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
            data: notification.data,
        };

        const response = await messaging.send(message);
        console.log('[FCM] Successfully sent message:', response);
        return { success: true, messageId: response };
    } catch (error: any) {
        console.error('[FCM] Error sending notification:', error);

        // Check if token is invalid
        if (error.code === 'messaging/registration-token-not-registered' ||
            error.code === 'messaging/invalid-registration-token') {
            return { success: false, error: 'NotRegistered' };
        }

        return { success: false, error: error.message || String(error) };
    }
}

/**
 * Send order notification to all registered admin devices
 */
export async function sendOrderNotificationToAdmins(
    orderId: number,
    customerName: string,
    totalAmount: number
): Promise<{ sent: number; failed: number }> {
    // Import supabase here to avoid circular dependencies
    const { createClient } = await import("@supabase/supabase-js");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all FCM tokens
    const { data: tokens, error } = await supabase
        .from("fcm_tokens")
        .select("token");

    if (error || !tokens || tokens.length === 0) {
        console.log("[FCM] No tokens found or error:", error);
        return { sent: 0, failed: 0 };
    }

    const notification: NotificationPayload = {
        title: "🛒 طلب جديد!",
        body: `طلب جديد من ${customerName} - ${totalAmount.toFixed(2)} ج.م`,
        data: {
            order_id: orderId.toString(),
            url: `/admin/orders/${orderId}`,
            type: "new_order",
        },
    };

    let sent = 0;
    let failed = 0;

    // Send to all tokens
    const results = await Promise.allSettled(
        tokens.map((t) => sendPushNotification(t.token, notification))
    );

    results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
            sent++;
        } else {
            failed++;
            // Remove invalid tokens
            if (result.status === "fulfilled" && result.value.error === "NotRegistered") {
                supabase.from("fcm_tokens").delete().eq("token", tokens[index].token);
            }
        }
    });

    console.log(`[FCM] Notifications sent: ${sent}, failed: ${failed}`);
    return { sent, failed };
}
