import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

// Google Analytics 4 Property ID (just the number, not the full "properties/xxx" format)
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '497336931'; // From your GA4 property

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    try {
        // Check if credentials are configured
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            return NextResponse.json({
                visitors: 0,
                sessions: 0,
                error: 'Google Analytics not configured yet'
            });
        }

        // Parse credentials from environment variable
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

        // Initialize the client with credentials
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
        });

        // Run the report
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: startDate,
                    endDate: endDate,
                },
            ],
            metrics: [
                { name: 'activeUsers' },    // Unique visitors
                { name: 'sessions' },       // Total sessions
                { name: 'screenPageViews' }, // Page views
            ],
        });

        const visitors = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
        const sessions = parseInt(response.rows?.[0]?.metricValues?.[1]?.value || '0');
        const pageViews = parseInt(response.rows?.[0]?.metricValues?.[2]?.value || '0');

        return NextResponse.json({
            visitors,
            sessions,
            pageViews,
            startDate,
            endDate,
        });

    } catch (error: any) {
        console.error('[GA4 API] Error:', error);
        return NextResponse.json({
            visitors: 0,
            sessions: 0,
            pageViews: 0,
            error: error.message
        });
    }
}
