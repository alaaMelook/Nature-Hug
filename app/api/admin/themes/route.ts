import { NextRequest, NextResponse } from 'next/server';
import { ThemesRepository } from '@/data/repositories/server/iThemesRepository';

const themesRepo = new ThemesRepository();

// GET all themes
export async function GET() {
    try {
        const themes = await themesRepo.getAll();
        return NextResponse.json({ themes });
    } catch (error) {
        console.error('[API] Failed to get themes:', error);
        return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
    }
}

// POST create new theme
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const theme = await themesRepo.create(body);
        return NextResponse.json({ theme });
    } catch (error) {
        console.error('[API] Failed to create theme:', error);
        return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
    }
}
