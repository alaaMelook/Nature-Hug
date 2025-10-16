import { Star } from "lucide-react";

export const StarRating = ({ rating }: { rating: number }) => {
    console.log(rating);
    const stars = Array(5).fill(0).map((_, index) => (
        <Star
            key={index}
            size={18}
            className={`transition duration-150 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />

    ));
    return <div className="flex gap-0.5">{stars}</div>;
};