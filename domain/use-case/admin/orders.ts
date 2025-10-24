import { IAdminRepository } from "@/data/repositories/iAdminRepository";

export class getRecentOrders {
    constructor(private repo = new IAdminRepository()) { }

    async execute() {
        return this.repo.getOrderDetails();
    }
}