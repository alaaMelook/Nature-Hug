
import { IAuthRepository } from "@/data/repositories/iAuthRepository";
import { Customer } from "@/domain/entities/database/customer";
import { Member } from "@/domain/entities/database/member";
import { Session, User } from "@supabase/supabase-js";

export interface AuthRepository {
    getSession(): Promise<Session | null>;
    getCurrentUser(): Promise<User | null>;
    signInWithEmail(email: string, password: string): Promise<{ error?: string }>;
    signUpWithEmail(email: string, password: string, name?: string): Promise<{ error?: string }>;
    signInWithGoogle(): Promise<{ error?: string }>;
    signOut(): Promise<void>;
    fetchCustomer(authUserId: string): Promise<Customer | null>;
    fetchMember(customerId: number): Promise<Member | null>;
}

export const AuthRepo: AuthRepository = new IAuthRepository();