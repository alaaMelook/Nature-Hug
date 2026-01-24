import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Search Console requires the site URL as the property identifier
const SITE_URL = 'https://nature-hug.com'; // Adjust this to your actual site URL

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    try {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            return NextResponse.json({ error: 'GA4 not configured', keywords: [] });
        }

        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

        const auth = new google.auth.JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });

        const searchconsole = google.searchconsole({ version: 'v1', auth });

        // Convert GA4-style dates to YYYY-MM-DD for Search Console
        const formatDate = (dateStr: string) => {
            if (dateStr.includes('daysAgo')) {
                const days = parseInt(dateStr.replace('daysAgo', ''));
                const d = new Date();
                d.setDate(d.getDate() - days);
                return d.toISOString().split('T')[0];
            }
            if (dateStr === 'today') return new Date().toISOString().split('T')[0];
            return dateStr;
        };

        const [response] = await Promise.all([
            searchconsole.searchanalytics.query({
                siteUrl: SITE_URL,
                requestBody: {
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate),
                    dimensions: ['query'],
                    rowLimit: 15
                }
            })
        ]);

        const keywords = (response.data.rows || []).map(row => ({
            query: row.keys?.[0] || 'unknown',
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: (row.ctr || 0) * 100,
            position: row.position || 0
        }));

        return NextResponse.json({ keywords });

    } catch (error: any) {
        console.error('[Search Console API] Error:', error);
        // If the property is not found or no access, return empty list instead of erroring out the whole dashboard
        return NextResponse.json({
            error: error.message,
            keywords: [],
            note: "Make sure service account has access to the Search Console property: " + SITE_URL
        });
    }
}
