import { getOrderByAwbOrId } from "@/domain/use-case/store/getOrderByAwbOrId";
import { TrackingScreen } from "@/ui/client-screens/(store)/tracking-screen";

export default async function TrackingPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ order?: string; awb?: string }>;
}) {
    const { lang } = await params;
    const { order: orderId, awb } = await searchParams;

    let orderData = null;
    let error = null;

    if (orderId || awb) {
        try {
            orderData = await getOrderByAwbOrId(orderId || undefined, awb || undefined);
        } catch (e) {
            error = "Order not found";
        }
    }

    return <TrackingScreen initialOrder={orderData} initialError={error} lang={lang} />;
}
