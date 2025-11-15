import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";
import { orderStatus } from "@/lib/utils/status";

export function OrderDetailsModal({
    order,
    onClose,
}: {
    order: OrderDetailsView | null;
    onClose: () => void;
}) {
    if (!order) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden
            />
            <div className="relative bg-white rounded-lg max-w-3xl w-full shadow-lg overflow-auto max-h-[90vh] p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                >
                    ✕
                </button>

                <h2 className="text-lg font-semibold mb-2">Order #{order.order_id}</h2>
                <div className="mb-4">
                    <p>
                        <strong>Status:</strong> {order.order_status ?? "-"}
                    </p>
                    <p>
                        <strong>Total:</strong> {order.final_order_total ?? "0.00"}
                    </p>

                    <strong>Created:</strong>{" "}
                    {order ? new Date(order.order_date).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', hour12: true }).split(',').map((info, ind) =>
                        <div key={ind}>{info}</div>
                    ) : "-"}

                    <p>
                        {/*<strong>Admin:</strong> {order.created_by_admin ?? "-"}*/}
                    </p>
                </div>
                <div className="border-t pt-4 flex justify-between pr-5">

                    <div className="mb-4">
                        <h3 className="font-semibold">Customer</h3>
                        <p>{order.customer_name ?? "-"}</p>
                        <p className="text-sm text-gray-600">{order.phone_numbers.toString() ?? "-"}</p>
                        <p className="text-sm text-gray-600">{order.shipping_street_address ?? "-"}</p>
                        <p className="text-sm text-gray-600">
                            Governorate: {order.shipping_governorate ?? "-"}
                        </p>
                    </div>
                    <div className=" mb-4">
                        <h3 className="font-semibold">Items</h3>
                        <ul className="list-disc pl-3">
                            {order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <li key={index} className="text-sm"> {item.quantity}x {item.item_name} </li>
                                ))
                            ) : (
                                <li>No items found.</li>
                            )}
                        </ul>
                    </div>
                </div>
                {order.order_status !== 'completed' &&
                    <button
                        onClick={onClose //change status
                        }
                        className=" border-1 rounded-md px-4 py-2 border-primary-950 text-primary-950"
                    >
                        {order.order_status === 'processing' ? 'Ready to ship' : 'Accept Order'}
                    </button>
                }
            </div>
        </div>
    );
}
function orderActions({ status }: { status: string }) {
    switch (status) {
        case 'pending':
            return { pos: 'Accept Order', neg: 'Reject Order', status_pos: 'processing', status_neg: 'declined' };
        case 'processing':
            return { pos: 'Mark as Out for delivery', neg: 'Cancel Order', status_pos: 'out for delivery', status_neg: 'declined' };
        case 'out for delivery':
            return { pos: 'Mark as Shipped', neg: 'Cancel Order', status_pos: 'shipped', status_neg: 'declined' };
        case 'shipped':
            return { pos: 'Mark as Delivered', neg: 'Return Order', status_pos: 'completed', status_neg: 'returned' };
        default:
            return [];
    }


}