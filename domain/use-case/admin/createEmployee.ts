import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { CreateEmployeeData, CreateEmployeeResponse } from "@/domain/entities/auth/employee";

export class CreateEmployee {
    private repository: IAdminServerRepository;

    constructor() {
        this.repository = new IAdminServerRepository();
    }

    async execute(data: CreateEmployeeData): Promise<CreateEmployeeResponse> {
        console.log("[CreateEmployee] execute called");

        // Validate required fields
        if (!data.email || !data.email.includes('@')) {
            throw new Error("Valid email is required");
        }

        if (!data.name || data.name.trim().length < 2) {
            throw new Error("Name must be at least 2 characters");
        }

        if (!data.role) {
            throw new Error("Role is required");
        }

        // If not auto-generating, validate password
        if (!data.autoGeneratePassword && data.password) {
            if (data.password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }
        }

        try {
            const result = await this.repository.createEmployee(data);
            console.log("[CreateEmployee] Employee created successfully");
            return result;
        } catch (error) {
            console.error("[CreateEmployee] Error:", error);
            throw error;
        }
    }
}
