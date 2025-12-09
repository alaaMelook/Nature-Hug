import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";

export class GetAllGovernorates {
    constructor(private repo = new ICustomerServerRepository()) {
    }
    async execute() {
        return await this.repo.fetchAllGovernorates();
    }
    async bySlug(slug: string) {
        return await this.repo.fetchGovernorate(slug);
    }

}