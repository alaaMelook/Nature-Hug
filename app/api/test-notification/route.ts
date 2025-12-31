import { NextResponse } from 'next/server';
import { sendPushNotification, sendOrderNotificationToAdmins } from '@/lib/services/fcmService';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        // Test Firebase Admin initialization
        console.log('[Test] Starting notification test...');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if there are any FCM tokens
        const { data: tokens, error: tokenError } = await supabase
            .from('fcm_tokens')
            .select('*');

        if (tokenError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch tokens',
                details: tokenError.message,
                step: 'fetch_tokens'
            }, { status: 500 });
        }

        if (!tokens || tokens.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No FCM tokens found in database',
                help: 'You need to click "تفعيل الإشعارات" button in Admin Sidebar first',
                step: 'no_tokens'
            }, { status: 400 });
        }

        console.log('[Test] Found tokens:', tokens.length);

        // Try sending a test notification
        const result = await sendOrderNotificationToAdmins(
            999,
            'Test User',
            100.00
        );

        return NextResponse.json({
            success: true,
            tokens_count: tokens.length,
            tokens: tokens.map(t => ({
                user_id: t.user_id,
                device: t.device_info?.substring(0, 50),
                token_preview: t.token.substring(0, 20) + '...'
            })),
            notification_result: result
        });

    } catch (error: any) {
        console.error('[Test] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            stack: error.stack?.split('\n').slice(0, 3),
            step: 'exception'
        }, { status: 500 });
    }
}
