import React from "react";
import { Bazaars } from "@/domain/use-case/admin/bazaars";
import BazaarsScreen from "@/ui/client-screens/admin/bazaars-screen";
import { getAdminStaffPermissions } from "@/lib/admin-helpers";

export default async function BazaarsPage() {
    const [bazaars, { permissions }] = await Promise.all([
        new Bazaars().getAllWithStats(),
        getAdminStaffPermissions(),
    ]);

    // POS-only = has bazaars.pos but NOT full bazaars access
    const isPosOnly = permissions.length > 0
        && permissions.includes('bazaars.pos')
        && !permissions.includes('bazaars');

    return <BazaarsScreen bazaars={bazaars} isPosOnly={isPosOnly} />;
}
