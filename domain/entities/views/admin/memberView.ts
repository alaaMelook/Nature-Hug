import { EmployeePermissions } from "@/domain/entities/auth/permissions";

export interface MemberView {
    id: number,
    name: string,
    email: string,
    role: MemberRole,
    created_at: string,
    permissions?: EmployeePermissions,
    phone?: string,
    customer_id?: number,
}