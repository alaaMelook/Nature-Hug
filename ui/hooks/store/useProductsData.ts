import { IProductClientRepository } from "@/data/repositories/client/iProductsRepository";

export class GetProductsData {
    constructor(private lang: LangKey = 'ar', private repo = new IProductClientRepository(lang)) {
    }

    async recent(count: number = 4) {
        return await this.repo.viewRecent(count);
    }

    async all() {
        return await this.repo.viewAll();
    }

    async bySlug(slug: string) {
        return await this.repo.viewBySlug(slug);
    }
}
