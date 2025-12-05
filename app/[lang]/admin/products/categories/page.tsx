import { GetAllCategories } from "@/domain/use-case/store/getAllCategories";
import CategoriesScreen from "@/ui/client-screens/admin/categories-screen";
import { GetAllImages } from "@/domain/use-case/admin/images";

export default async function CategoriesPage() {
  const categories = await new GetAllCategories().execute();
  const images = await new GetAllImages().execute();

  return <CategoriesScreen initialCategories={categories} initialImages={images} />;
}