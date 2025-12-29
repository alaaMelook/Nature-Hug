import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { MemberView } from "@/domain/entities/views/admin/memberView";

export class GetAllEmployees {
    private repository: IAdminServerRepository;

    constructor() {
        this.repository = new IAdminServerRepository();
    }

    async execute(): Promise<MemberView[]> {
        console.log("[GetAllEmployees] execute called");

        try {
            const employees = await this.repository.getAllEmployees();
            console.log("[GetAllEmployees] Found", employees.length, "employees");
            return employees;
        } catch (error) {
            console.error("[GetAllEmployees] Error:", error);
            throw error;
        }
    }
}
