import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { EmployeePermissions } from "@/domain/entities/auth/permissions";

export class UpdateEmployeePermissions {
    private repository: IAdminServerRepository;

    constructor() {
        this.repository = new IAdminServerRepository();
    }

    async execute(memberId: number, permissions: EmployeePermissions): Promise<void> {
        console.log("[UpdateEmployeePermissions] execute called for member:", memberId);

        if (!memberId || memberId <= 0) {
            throw new Error("Valid member ID is required");
        }

        try {
            await this.repository.updateMemberPermissions(memberId, permissions);
            console.log("[UpdateEmployeePermissions] Permissions updated successfully");
        } catch (error) {
            console.error("[UpdateEmployeePermissions] Error:", error);
            throw error;
        }
    }
}

export class UpdateEmployeeRole {
    private repository: IAdminServerRepository;

    constructor() {
        this.repository = new IAdminServerRepository();
    }

    async execute(memberId: number, role: MemberRole): Promise<void> {
        console.log("[UpdateEmployeeRole] execute called for member:", memberId, "role:", role);

        if (!memberId || memberId <= 0) {
            throw new Error("Valid member ID is required");
        }

        if (!['admin', 'moderator', 'user'].includes(role)) {
            throw new Error("Invalid role. Must be admin, moderator, or user");
        }

        try {
            await this.repository.updateMemberRole(memberId, role);
            console.log("[UpdateEmployeeRole] Role updated successfully");
        } catch (error) {
            console.error("[UpdateEmployeeRole] Error:", error);
            throw error;
        }
    }
}
