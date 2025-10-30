import {ICustomerRepository} from "@/data/repositories/iCustomerRepository";
import {Customer} from "@/domain/entities/auth/customer";
import {Member} from "@/domain/entities/auth/member";
import {Session, User} from "@supabase/supabase-js";
import {ProfileView} from "@/domain/entities/views/shop/profileView";
import {MemberView} from "@/domain/entities/views/admin/memberView";

export interface CustomerRepository {
    getSession(): Promise<Session | null>;

    getCurrentUser(): Promise<User | null>;

    signInWithEmail(email: string, password: string): Promise<{ error?: string }>;

    signUpWithEmail(email: string, password: string, name?: string): Promise<{ error?: string }>;

    signInWithGoogle(): Promise<{ error?: string }>;

    signOut(): Promise<void>;

    fetchCustomer(authUserId: string): Promise<Customer>; // Stays here as it links auth user to customer
    fetchMember(customerId: number): Promise<Member | null>; // This could move to a future MemberRepository
    fetchAllMembers(): Promise<Member[]>; // This could move to a future MemberRepository
    getAllCustomers(): Promise<ProfileView[]>; // Should move to a new CustomerRepository
    getAllMembers(): Promise<MemberView[]>; // Should move to a new MemberRepository
    viewProfile(customerId: number): Promise<ProfileView>; // Should move to a new CustomerRepository
    viewMember(memberId: number): Promise<MemberView>;
}

export const CustomerRepo: CustomerRepository = new ICustomerRepository();
