import { Review } from "@/domain/entities/database/review";
import { AddProductReview } from "@/domain/use-case/shop/addProductReview";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function addReview({ onError, onSuccess }: { onError?: (error: Error) => void, onSuccess?: () => void }) {
    return useMutation({
        mutationFn: (review: Review) => new AddProductReview().execute(review),
        onSuccess: onSuccess,
        onError: onError
    });
}