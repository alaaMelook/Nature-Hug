import { IProductClientRepository } from "@/data/repositories/client/iProductsRepository";

export class GetProductDetails {
    constructor(private lang: LangKey = 'ar', private repo = new IProductClientRepository(lang)) {
    }

    async bySlug(slug: string) {
        return await this.repo.viewDetailedBySlug(slug);
    }

}
