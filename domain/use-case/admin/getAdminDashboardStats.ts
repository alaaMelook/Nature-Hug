import {IAdminServerRepository} from "@/data/repositories/server/iAdminRepository";

export class GetAdminDashboardStats {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute() {
        try {
            console.log("[getAdminDashboardStats] execute called.");
            console.log("[getAdminDashboardStats] Calling getDashboardMetrics.");
            const data = await this.repo.getDashboardMetrics();
            console.log("[getAdminDashboardStats] getDashboardMetrics result:", data);

            return data;
        } catch (error) {
            console.error("[getAdminDashboardStats] Error in execute:", error);
            throw error;
        }
    }
}

