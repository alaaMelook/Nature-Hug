import React from "react";
import { Bazaars } from "@/domain/use-case/admin/bazaars";
import EditBazaarForm from "@/ui/client-screens/admin/edit-bazaar-form";
import { redirect } from "next/navigation";

export default async function EditBazaarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bazaarId = parseInt(id);

    const bazaar = await new Bazaars().getById(bazaarId);
    if (!bazaar) redirect("/admin/bazaars");

    return <EditBazaarForm bazaar={bazaar} />;
}
