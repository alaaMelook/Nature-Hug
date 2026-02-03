import { NextRequest, NextResponse } from 'next/server';
import { GetAutoApplyPromoCodes } from '@/domain/use-case/store/getAutoApplyPromoCodes';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');

        const useCase = new GetAutoApplyPromoCodes();
        const promoCodes = await useCase.execute(customerId ? parseInt(customerId) : undefined);

        return NextResponse.json({ promoCodes });
    } catch (error) {
        console.error('[API] Failed to get auto-apply promos:', error);
        return NextResponse.json({ promoCodes: [] }, { status: 500 });
    }
}
