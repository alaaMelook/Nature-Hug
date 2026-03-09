import React from "react";
import { Bazaars } from "@/domain/use-case/admin/bazaars";
import BazaarsScreen from "@/ui/client-screens/admin/bazaars-screen";

export default async function BazaarsPage() {
    const bazaars = await new Bazaars().getAllWithStats();

    return <BazaarsScreen bazaars={bazaars} />;
}
