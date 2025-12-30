import React from "react";
import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetAllPromoCodes } from "@/domain/use-case/admin/promo-codes/getAllPromoCodes";
import { AdminCreateOrderScreen } from "@/ui/client-screens/admin/admin-create-order-screen";

export default async function CreateOrderPage() {
    const productRepo = new IProductServerRepository();
    const customerRepo = new ICustomerServerRepository();

    const [products, governorates, promoCodes] = await Promise.all([
        productRepo.viewAll(),
        customerRepo.fetchAllGovernorates(),
        new GetAllPromoCodes().execute()
    ]);

    return (
        <AdminCreateOrderScreen
            products={products}
            governorates={governorates}
            promoCodes={promoCodes}
        />
    );
}
