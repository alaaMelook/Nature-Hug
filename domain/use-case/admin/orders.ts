import {IAdminServerRepository} from "@/data/repositories/server/iAdminRepository";

export class getRecentOrders {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute() {
        try {
            console.log("[getRecentOrders] execute called.");
            console.log("[getRecentOrders] Calling getOrderDetails.");
            const result = await this.repo.getOrderDetails();
            console.log("[getRecentOrders] getOrderDetails result:", result);
            return result;
        } catch (error) {
            console.error("[getRecentOrders] Error in execute:", error);
            throw error;
        }
    }
}