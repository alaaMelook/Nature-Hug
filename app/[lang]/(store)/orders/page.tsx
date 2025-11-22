import {FetchOrders} from '@/domain/use-case/shop/fetchOrders';
import OrdersScreen from '@/ui/client-screens/(store)/orders-screen';

export default async function OrderPage() {
    let orders = await new FetchOrders().execute();
    orders = orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return (
        <OrdersScreen orders={orders}/>
    );
}