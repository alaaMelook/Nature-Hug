import { IProductClientRepository } from "@/data/repositories/client/iProductsRepository";

export async function useCategories(lang: LangKey = 'ar') {
    return await new IProductClientRepository(lang).getAllCategories();
}