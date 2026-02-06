import { createSupabaseServerClient as createClient } from '@/data/datasources/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: Request order cancellation
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a distributor
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!member || member.role !== 'distributor') {
            return NextResponse.json({ error: 'Not a distributor' }, { status: 403 });
        }

        // Get distributor's customer ID
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!customer) {
            return NextResponse.json({ error: 'Distributor profile not found' }, { status: 404 });
        }

        const orderId = parseInt(params.id);

        // Verify this order belongs to the distributor
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, created_by_distributor_id, status')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.created_by_distributor_id !== customer.id) {
            return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 });
        }

        // Can only request cancel for pending orders
        if (order.status !== 'pending') {
            return NextResponse.json({
                error: 'Can only request cancellation for pending orders'
            }, { status: 400 });
        }

        // Update order with cancel request flag
        const { error: updateError } = await supabase
            .from('orders')
            .update({ cancel_requested: true })
            .eq('id', orderId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cancel request error:', error);
        return NextResponse.json({ error: 'Failed to request cancellation' }, { status: 500 });
    }
}
