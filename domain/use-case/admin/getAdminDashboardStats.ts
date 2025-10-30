import { IAdminRepository } from "@/data/repositories/iAdminRepository";
import { AdminRepository } from "@/domain/repositories/adminRepository";

export class getAdminDashboardStats {
    constructor(private repo = new IAdminRepository()) { }

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