import {IProductClientRepository} from "@/data/repositories/client/iProductsRepository";

export class GetProductDetails {
    constructor(private repo = new IProductClientRepository()) {
    }

    async bySlug(slug: string) {
        return await this.repo.viewBySlug(slug);
    }

}
