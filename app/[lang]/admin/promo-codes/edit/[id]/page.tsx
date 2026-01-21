import EditPromoCodeForm from "@/ui/client-screens/admin/edit-promo-code-form";
import { ViewAllWithDetails } from "@/domain/use-case/admin/products/viewAllWithDetails";
import { ViewProfile } from "@/domain/use-case/store/viewProfile";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";
import { notFound } from "next/navigation";
import { PromoCode } from "@/domain/entities/database/promoCode";

export default async function EditPromoCodePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const promoId = parseInt(id);

    if (isNaN(promoId)) {
        notFound();
    }

    const [promoCodes, products, customers] = await Promise.all([
        new GetAllPromoCodes().execute(),
        new ViewAllWithDetails().execute(),
        new ViewProfile().executeForAll(),
    ]);

    const promoCode = promoCodes.find((p: PromoCode) => p.id === promoId);

    if (!promoCode) {
        notFound();
    }

    return (
        <div className="p-6">
            <EditPromoCodeForm
                promoCode={promoCode}
                products={products}
                customers={customers || []}
            />
        </div>
    );
}
