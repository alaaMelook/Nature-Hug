import { EmployeePermissions } from "./permissions";

// Data required to create a new employee
export interface CreateEmployeeData {
    email: string;
    password?: string; // Optional - if not provided, will be auto-generated
    name: string;
    phone?: string;
    role: MemberRole;
    permissions?: EmployeePermissions;
    autoGeneratePassword?: boolean;
}

// Response from creating an employee
export interface CreateEmployeeResponse {
    member: {
        id: number;
        user_id: number;
        role: MemberRole;
        permissions?: EmployeePermissions;
    };
    customer: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    generatedPassword?: string; // Only returned if auto-generated
}
