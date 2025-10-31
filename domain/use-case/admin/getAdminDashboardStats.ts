import {IAdminServerRepository} from "@/data/repositories/server/iAdminRepository";

export class getAdminDashboardStats {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute() {
        try {
            console.log("[getAdminDashboardStats] execute called.");
            console.log("[getAdminDashboardStats] Calling getDashboardMetrics.");
            const result = await this.repo.getDashboardMetrics();
            console.log("[getAdminDashboardStats] getDashboardMetrics result:", result);
            return result;
        } catch (error) {
            console.error("[getAdminDashboardStats] Error in execute:", error);
            throw error;
        }
    }
}