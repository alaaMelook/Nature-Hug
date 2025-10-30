import {useCart} from "@/ui/providers/CartProvider";
import {useMutation} from "@tanstack/react-query";
import { Order } from "@/domain/entities/database/order";
import {OrderItem} from "@/domain/entities/database/orderItem";
import {CreateOrder} from "@/domain/use-case/shop/createOrder";
import {Customer} from "@/domain/entities/auth/customer";

export function useCreateOrder() {
    const {cart, getCartNetTotal, getCartTotal} = useCart();

    const PrepareOrderData = (user: Customer): Order => {
        if (!user) {
            throw new Error("User not logged in");
        }
        return {
            created_at: new Date().toISOString(),
            customer_id: user.id,
            discount_total: cart.reduce(
                (prev, item) => prev + item.quantity * (item.discount || 0), 0),
            id: 0, // This will be set by the backend
            shipping_total: 50,
            tax_total: 0, // Assuming tax is not calculated here
            items: cart.map(item => ({
                product_id: item.id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                discount: item.discount || 0,
                unit_price: item.price,
                total: item.quantity * (item.price - (item.discount || 0)),
            }) as OrderItem),
            subtotal: getCartTotal(),
            grand_total: getCartNetTotal() + 50,
        };
    };
    const createOrder = () => useMutation({
        mutationKey: ["createOrder"],
        mutationFn: async (order: Order) => await new CreateOrder().execute(order),
    });

    return {
        PrepareOrderData,
        createOrder,
    };
}