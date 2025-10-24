import { IAdminRepository } from "@/data/repositories/iAdminRepository";
import { AdminRepository } from "@/domain/repositories/adminRepository";

export class getAdminDashboardStats {
    constructor(private repo = new IAdminRepository()) { }

    async execute() {
        return this.repo.getDashboardMetrics();
    }
}