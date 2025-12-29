import { EmployeePermissions } from "./permissions";

export interface Member {
    id: number;
    user_id: number;
    role: MemberRole;
    created_at: string;
    permissions?: EmployeePermissions;
}
