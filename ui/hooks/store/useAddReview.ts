'use server'

import { revalidatePath } from 'next/cache'
import { Review } from "@/domain/entities/database/review";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";
import { AddProductReview } from "@/domain/use-case/store/addProductReview";


export async function postReview(data: { product: number; rating: number; comment: string }) {
    const user = await new GetCurrentUser().execute();
    if (!user) return { error: 'User not logged in' };


    const review: Partial<Review> = {
        // id: 0,
        product_id: data['product'],
        customer_id: user.id,
        rating: data['rating'],
        comment: data['comment'],
        // status: 'pending',
        // created_at: '',
    };
    if (!review.product_id) return { error: 'Product not found' };

    await new AddProductReview().execute(review);

    revalidatePath('/', 'layout');
    return { success: true };
}
