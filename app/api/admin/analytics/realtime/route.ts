import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '497336931';

export async function GET() {
    try {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            return NextResponse.json({ activeUsers: 0 });
        }

        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
        });

        const [response] = await analyticsDataClient.runRealtimeReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            metrics: [{ name: 'activeUsers' }],
        });

        const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');

        return NextResponse.json({ activeUsers });

    } catch (error: any) {
        console.error('[GA4 Realtime API] Error:', error);
        return NextResponse.json({ activeUsers: 0, error: error.message });
    }
}
