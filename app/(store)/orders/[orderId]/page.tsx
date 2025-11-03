import {FetchOrder} from '@/domain/use-case/shop/fetchOrder';
import OrderDetailScreen from '@/ui/client-screens/(store)/order-detail-screen';

export default async function OrderPage({params, searchParams}: {
    params: { orderId: string | number } | Promise<{ orderId: string | number }>;
    searchParams: { fromCheckout?: string } | Promise<{ fromCheckout?: string }>;
}) {
    const orderId = Number((await params).orderId);
    const fromCheckout = Boolean((await searchParams)?.fromCheckout);
    const orderData = await new FetchOrder().execute(orderId);
    return (
        <OrderDetailScreen order={orderData} fromCheckout={fromCheckout}/>
    );
}