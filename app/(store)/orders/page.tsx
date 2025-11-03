import {FetchOrders} from '@/domain/use-case/shop/fetchOrders';
import OrdersScreen from '@/ui/client-screens/(store)/orders-screen';

export default async function OrderPage() {
    const orders = await new FetchOrders().execute();
    return (
        <OrdersScreen orders={orders}/>
    );
}