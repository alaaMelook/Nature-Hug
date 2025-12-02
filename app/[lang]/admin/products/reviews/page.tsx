import { GetAllReviews } from "@/domain/use-case/admin/reviews";
import { ReviewsScreen } from "@/ui/client-screens/admin/reviews-screen";

export default async function ReviewsPage() {
  const reviews = await new GetAllReviews().execute();
  return <ReviewsScreen reviews={reviews} />;
}