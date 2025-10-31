import {IProductClientRepository} from "@/data/repositories/client/iProductsRepository";

export class GetProductsData {
    constructor(private repo = new IProductClientRepository()) {
    }

    async recent(count: number = 4) {
        return await this.repo.viewRecent(count);
    }

    async all() {
        return await this.repo.viewAll();
    }
}
