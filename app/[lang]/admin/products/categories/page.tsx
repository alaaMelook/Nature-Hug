import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import CategoriesScreen from "@/ui/client-screens/admin/categories-screen";

export default async function CategoriesPage() {
  const categories = await new GetAllCategories().execute();

  return <CategoriesScreen initialCategories={categories} />;
}