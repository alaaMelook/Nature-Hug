'use server'

import {revalidatePath} from 'next/cache'
import {GetCurrentUser} from "@/domain/use-case/shop/getCurrentUser";
import {Customer, CustomerAddress} from "@/domain/entities/auth/customer";
import {AddUpdatePhone} from "@/domain/use-case/shop/addUpdatePhone";
import {AddUpdateAddress} from "@/domain/use-case/shop/addUpdateAddress";
import {DeleteAddress} from "@/domain/use-case/shop/deleteAddress";
import {ViewAddress} from "@/domain/entities/views/shop/profileView";


export async function updateOrAddPhone(data: Partial<{ index: number, phone: string | null }>) {
    const user = await new GetCurrentUser().execute();
    if (!user) return {error: 'User not logged in'};
    let sentData: Partial<Customer>;
    if (data.index === 1)
        sentData = {
            id: user.id,
            phone: data.phone,
        };
    else
        sentData = {
            id: user.id,
            phone2: data.phone,
        };
    await new AddUpdatePhone().execute(sentData);

    revalidatePath('/', 'layout');
    return {success: true};
}

export async function updateAddress(data: Partial<ViewAddress>) {
    const user = await new GetCurrentUser().execute();
    if (!user) return {error: 'User not logged in'};
    let sentData: Partial<CustomerAddress> = {
        customer_id: user.id,
        address: data.address,
        governorate_slug: data.governorate?.slug,
    };

    await new AddUpdateAddress().update(sentData);

    revalidatePath('/', 'layout');
    return {success: true};
}

export async function addAddress(data: Partial<CustomerAddress>) {
    const user = await new GetCurrentUser().execute();
    if (!user) return {error: 'User not logged in'};
    let sentData: Partial<CustomerAddress> = {
        customer_id: user.id,
        address: data.address,
        governorate_slug: data.governorate_slug,
    };

    await new AddUpdateAddress().add(sentData);

    revalidatePath('/', 'layout');
    return {success: true};
}

export async function deleteAddress(id: number) {
    const user = await new GetCurrentUser().execute();
    if (!user) return {error: 'User not logged in'};
    await new DeleteAddress().execute(id);
    revalidatePath('/', 'layout');
    return {success: true};

}