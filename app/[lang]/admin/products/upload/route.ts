import { NextResponse } from 'next/server';
import { UploadImage } from '@/domain/use-case/admin/images';

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get('file') as File | null;
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

        const url = await new UploadImage().execute(file);
        return NextResponse.json({ url });
    } catch (err: any) {
        console.error('[upload product image] error', err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
