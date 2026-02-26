export interface MemberView {
    id: number,
    name: string,
    email: string,
    role: MemberRole,
    created_at: string,
    permissions?: string[],
}