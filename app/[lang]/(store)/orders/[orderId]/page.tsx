import {FetchOrder} from '@/domain/use-case/shop/fetchOrder';
import OrderDetailScreen from '@/ui/client-screens/(store)/order-detail-screen';
import {cookies} from "next/headers";

export default async function OrderPage({params}: {
    params: { orderId: string | number } | Promise<{ orderId: string | number }>;
}) {
    const orderId = Number((await params).orderId);
    const cookie = await cookies();
    const fromCheckout = Boolean(cookie.get('fromCheckout')?.value ?? false);
    const customerId = Number(cookie.get('customer')?.value);
    const orderData = await new FetchOrder().execute(orderId, customerId);
    return (
        <OrderDetailScreen order={orderData} fromCheckout={fromCheckout}/>
    );
}