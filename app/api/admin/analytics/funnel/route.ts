import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '497336931';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    try {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            return NextResponse.json({ error: 'GA4 not configured', funnel: [] });
        }

        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
        });

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'eventName' }],
            metrics: [{ name: 'eventCount' }],
            dimensionFilter: {
                orGroup: {
                    expressions: [
                        { filter: { fieldName: 'eventName', stringFilter: { value: 'session_start' } } },
                        { filter: { fieldName: 'eventName', stringFilter: { value: 'view_item' } } },
                        { filter: { fieldName: 'eventName', stringFilter: { value: 'add_to_cart' } } },
                        { filter: { fieldName: 'eventName', stringFilter: { value: 'begin_checkout' } } },
                        { filter: { fieldName: 'eventName', stringFilter: { value: 'purchase' } } },
                    ]
                }
            }
        });

        const eventsMap: Record<string, number> = {
            'session_start': 0,
            'view_item': 0,
            'add_to_cart': 0,
            'begin_checkout': 0,
            'purchase': 0
        };

        (response.rows || []).forEach(row => {
            const name = row.dimensionValues?.[0]?.value;
            const count = parseInt(row.metricValues?.[0]?.value || '0');
            if (name && name in eventsMap) {
                eventsMap[name] = count;
            }
        });

        const funnelSteps = [
            { label: 'Total Visitors', name: 'session_start', count: eventsMap['session_start'] },
            { label: 'Product Viewed', name: 'view_item', count: eventsMap['view_item'] },
            { label: 'Added to Cart', name: 'add_to_cart', count: eventsMap['add_to_cart'] },
            { label: 'Started Checkout', name: 'begin_checkout', count: eventsMap['begin_checkout'] },
            { label: 'Purchased', name: 'purchase', count: eventsMap['purchase'] },
        ];

        return NextResponse.json({ funnel: funnelSteps });

    } catch (error: any) {
        console.error('[GA4 Funnel API] Error:', error);
        return NextResponse.json({ error: error.message, funnel: [] });
    }
}
