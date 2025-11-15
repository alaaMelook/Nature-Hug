import { IProductClientRepository } from "@/data/repositories/client/iProductsRepository";

export async function useCategories() {
    return await new IProductClientRepository().getAllCategories();
}