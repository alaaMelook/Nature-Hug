import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class DeleteEmployee {
    private repository: IAdminServerRepository;

    constructor() {
        this.repository = new IAdminServerRepository();
    }

    async execute(memberId: number): Promise<void> {
        console.log("[DeleteEmployee] execute called for member:", memberId);

        if (!memberId || memberId <= 0) {
            throw new Error("Valid member ID is required");
        }

        try {
            await this.repository.deleteEmployee(memberId);
            console.log("[DeleteEmployee] Employee deleted successfully");
        } catch (error) {
            console.error("[DeleteEmployee] Error:", error);
            throw error;
        }
    }
}
