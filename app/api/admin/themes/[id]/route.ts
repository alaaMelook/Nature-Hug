import { NextRequest, NextResponse } from 'next/server';
import { ThemesRepository } from '@/data/repositories/server/iThemesRepository';

const themesRepo = new ThemesRepository();

// GET single theme
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const theme = await themesRepo.getById(parseInt(id));
        if (!theme) {
            return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
        }
        return NextResponse.json({ theme });
    } catch (error) {
        console.error('[API] Failed to get theme:', error);
        return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 });
    }
}

// PUT update theme
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const theme = await themesRepo.update(parseInt(id), body);
        return NextResponse.json({ theme });
    } catch (error) {
        console.error('[API] Failed to update theme:', error);
        return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
    }
}

// DELETE theme
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await themesRepo.delete(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Failed to delete theme:', error);
        return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 });
    }
}

// PATCH - set as active
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const theme = await themesRepo.setActive(parseInt(id));
        return NextResponse.json({ theme });
    } catch (error) {
        console.error('[API] Failed to activate theme:', error);
        return NextResponse.json({ error: 'Failed to activate theme' }, { status: 500 });
    }
}
