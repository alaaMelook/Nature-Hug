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

// Diagnostic info for debugging
let initStatus = {
    initialized: false,
    usingServiceAccount: false,
    error: null as string | null,
    parseSuccess: false,
    privateKeyDetails: {
        length: 0,
        hasNewlines: false,
        hasLiteralNL: false,
        startsWith: '',
        endsWith: ''
    }
};

// Initialize Firebase Admin SDK (singleton)
function getFirebaseAdmin(): admin.app.App {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (admin.apps.length > 0) {
        // Force re-init if we have a service account now but weren't using one
        if (serviceAccountJson && !initStatus.usingServiceAccount) {
            console.log('[FCM] Found service account but current app is not using it. Re-initializing...');
            try {
                admin.apps[0]?.delete();
            } catch (e) {
                console.error('[FCM] Error deleting app:', e);
            }
        } else {
            initStatus.initialized = true;
            return admin.apps[0]!;
        }
    }

    if (serviceAccountJson) {
        try {
            // Remove surrounding single/double quotes if they exist
            let sanitizedJson = serviceAccountJson.trim();
            if ((sanitizedJson.startsWith("'") && sanitizedJson.endsWith("'")) ||
                (sanitizedJson.startsWith('"') && sanitizedJson.endsWith('"'))) {
                sanitizedJson = sanitizedJson.slice(1, -1);
            }

            const serviceAccount = JSON.parse(sanitizedJson);
            initStatus.parseSuccess = true;

            // Normalize private key
            if (serviceAccount.private_key) {
                const pk = serviceAccount.private_key;
                initStatus.privateKeyDetails = {
                    length: pk.length,
                    hasNewlines: pk.includes('\n'),
                    hasLiteralNL: pk.includes('\\n'),
                    startsWith: pk.substring(0, 25),
                    endsWith: pk.substring(pk.length - 25)
                };

                serviceAccount.private_key = pk.replace(/\\n/g, '\n');
            }

            const app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });

            initStatus.initialized = true;
            initStatus.usingServiceAccount = true;
            return app;
        } catch (error: any) {
            initStatus.error = error.message;
            console.error('[FCM] Initialization error:', error);
        }
    }

    // Fallback
    const app = admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    initStatus.initialized = true;
    initStatus.usingServiceAccount = false;
    return app;
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
        return { sent: 0, failed: 0, debug_info: "No tokens or error" } as any;
    }

    const notification: NotificationPayload = {
        title: "🛒 طلب جديد!",
        body: `طلب جديد من ${customerName} - ${totalAmount.toFixed(2)} ج.م`,
        data: {
            order_id: orderId.toString(),
            url: `/admin/orders/${orderId}`,
            type: "new_order",
            sound: "/sounds/ka-ching.mp3"
        },
    };

    let sent = 0;
    let failed = 0;
    let errors: string[] = [];

    // Send to all tokens
    const results = await Promise.allSettled(
        tokens.map((t) => sendPushNotification(t.token, notification))
    );

    results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
            sent++;
        } else {
            failed++;
            const errorMsg = result.status === "fulfilled" ? result.value.error : String((result as any).reason);
            if (errors.length < 5) errors.push(`${tokens[index].token.substring(0, 10)}...: ${errorMsg}`);

            // Remove invalid tokens
            if (result.status === "fulfilled" && result.value.error === "NotRegistered") {
                supabase.from("fcm_tokens").delete().eq("token", tokens[index].token);
            }
        }
    });

    console.log(`[FCM] Notifications sent: ${sent}, failed: ${failed}`);
    return { sent, failed, errors, diag: initStatus } as any;
}
