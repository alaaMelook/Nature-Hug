import { NextResponse } from 'next/server';
import { AddProduct } from '@/domain/use-case/admin/products';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const id = await new AddProduct().execute(body);
        return NextResponse.json({ id });
    } catch (err: any) {
        console.error('[create product route] error', err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
