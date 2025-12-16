import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class GetAdminDashboardStats {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute({ startDate, endDate }: { startDate: string, endDate: string }) {
        try {
            console.log("[getAdminDashboardStats] execute called.");
            console.log("[getAdminDashboardStats] Calling getDashboardMetrics.");
            const data = await this.repo.getDashboardMetrics(startDate, endDate);
            console.log("[getAdminDashboardStats] getDashboardMetrics result:", data);

            return data;
        } catch (error) {
            console.error("[getAdminDashboardStats] Error in execute:", error);
            throw error;
        }
    }
}

