export type MemberRole = 'admin' | 'moderator' | 'user';

export interface Member {
    id: number;
    user_id: number;
    role: MemberRole;
    created_at: string;
}
