import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '497336931';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    try {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            return NextResponse.json({
                error: 'Google Analytics not configured yet',
                visitors: 0, sessions: 0, pageViews: 0, bounceRate: 0,
                avgSessionDuration: 0, newUsers: 0, returningUsers: 0
            });
        }

        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
        });

        // Main metrics report
        const [metricsResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
                { name: 'bounceRate' },
                { name: 'averageSessionDuration' },
                { name: 'newUsers' },
            ],
        });

        // Top pages report
        const [pagesResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 10,
        });

        // Traffic sources report
        const [sourcesResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: 10,
        });

        // Device category report
        const [devicesResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'sessions' }],
        });

        // Country report
        const [countryResponse] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: 10,
        });

        const row = metricsResponse.rows?.[0]?.metricValues || [];
        const visitors = parseInt(row[0]?.value || '0');
        const sessions = parseInt(row[1]?.value || '0');
        const pageViews = parseInt(row[2]?.value || '0');
        const bounceRate = parseFloat(row[3]?.value || '0') * 100;
        const avgSessionDuration = parseFloat(row[4]?.value || '0');
        const newUsers = parseInt(row[5]?.value || '0');
        const returningUsers = visitors - newUsers;

        // Format top pages
        const topPages = (pagesResponse.rows || []).map(r => ({
            path: r.dimensionValues?.[0]?.value || '',
            views: parseInt(r.metricValues?.[0]?.value || '0'),
        }));

        // Format traffic sources
        const trafficSources = (sourcesResponse.rows || []).map(r => ({
            source: r.dimensionValues?.[0]?.value || '',
            sessions: parseInt(r.metricValues?.[0]?.value || '0'),
        }));

        // Format devices
        const devices = (devicesResponse.rows || []).map(r => ({
            device: r.dimensionValues?.[0]?.value || '',
            sessions: parseInt(r.metricValues?.[0]?.value || '0'),
        }));

        // Format countries
        const countries = (countryResponse.rows || []).map(r => ({
            country: r.dimensionValues?.[0]?.value || '',
            sessions: parseInt(r.metricValues?.[0]?.value || '0'),
        }));

        return NextResponse.json({
            visitors,
            sessions,
            pageViews,
            bounceRate: bounceRate.toFixed(1),
            avgSessionDuration: Math.round(avgSessionDuration),
            newUsers,
            returningUsers,
            topPages,
            trafficSources,
            devices,
            countries,
            startDate,
            endDate,
        });

    } catch (error: any) {
        console.error('[GA4 Full Analytics] Error:', error);
        return NextResponse.json({
            error: error.message,
            visitors: 0, sessions: 0, pageViews: 0, bounceRate: '0',
            avgSessionDuration: 0, newUsers: 0, returningUsers: 0,
            topPages: [], trafficSources: [], devices: [], countries: []
        });
    }
}
