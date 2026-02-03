import { NextResponse } from 'next/server';
import { ThemesRepository } from '@/data/repositories/server/iThemesRepository';

const themesRepo = new ThemesRepository();

// GET active theme for storefront
export async function GET() {
    try {
        const theme = await themesRepo.getActive();
        return NextResponse.json({ theme });
    } catch (error) {
        console.error('[API] Failed to get active theme:', error);
        return NextResponse.json({ theme: null }, { status: 500 });
    }
}
