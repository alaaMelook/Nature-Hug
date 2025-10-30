import {Member} from "@/domain/entities/auth/member";
import {Customer} from "@/domain/entities/auth/customer";
import {CustomerRepository} from "@/domain/repositories/customerRepository";
import {Session, User} from "@supabase/supabase-js";
import {ProfileView} from "@/domain/entities/views/shop/profileView";
import {MemberView} from "@/domain/entities/views/admin/memberView";
import {createSupabaseServerClient} from "@/data/datasources/supabase/server";

export class ICustomerRepository implements CustomerRepository {
    async getSession(): Promise<Session | null> {
        try {
            console.log("[ICustomerRepository] getSession called.");
            const {data} = await (await this.getClient()).auth.getSession();
            console.log("[ICustomerRepository] getSession result:", data.session);
            return data.session;
        } catch (error) {
            console.error("[ICustomerRepository] Error in getSession:", error);
            throw error;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            console.log("[ICustomerRepository] getCurrentUser called.");
            const {data} = await (await this.getClient()).auth.getUser();
            console.log("[ICustomerRepository] getCurrentUser result:", data.user);
            return data.user;
        } catch (error) {
            console.error("[ICustomerRepository] Error in getCurrentUser:", error);
            throw error;
        }
    }

    async signInWithEmail(email: string, password: string): Promise<{ error?: string }> {
        try {
            console.log("[ICustomerRepository] signInWithEmail called with email:", email);
            const {error} = await (await this.getClient()).auth.signInWithPassword({email, password});
            if (error) throw error;
            console.log("[ICustomerRepository] signInWithEmail completed.");
            return {};
        } catch (error) {
            console.error("[ICustomerRepository] Error in signInWithEmail:", error);
            throw error;
        }
    }

    async signUpWithEmail(email: string, password: string, name?: string): Promise<{ error?: string }> {
        try {
            console.log("[ICustomerRepository] signUpWithEmail called with email:", email);
            const {error} = await (await this.getClient()).auth.signUp({
                email,
                password,
                options: {data: {name}},
            });
            if (error) throw error;
            console.log("[ICustomerRepository] signUpWithEmail completed.");
            return {};
        } catch (error) {
            console.error("[ICustomerRepository] Error in signUpWithEmail:", error);
            throw error;
        }
    }

    async signInWithGoogle(): Promise<{ error?: string }> {
        try {
            console.log("[ICustomerRepository] signInWithGoogle called.");
            const {error} = await (await this.getClient()).auth.signInWithOAuth({
                provider: "google",
                options: {redirectTo: `${window.location.origin}/callback`},
            });
            if (error) throw error;
            console.log("[ICustomerRepository] signInWithGoogle completed.");
            return {};
        } catch (error) {
            console.error("[ICustomerRepository] Error in signInWithGoogle:", error);
            throw error;
        }
    }

    async signOut(): Promise<void> {
        try {
            console.log("[ICustomerRepository] signOut called.");
            await (await this.getClient()).auth.signOut();
            console.log("[ICustomerRepository] signOut completed.");
        } catch (error) {
            console.error("[ICustomerRepository] Error in signOut:", error);
            throw error;
        }
    }

    async fetchCustomer(authUserId: string): Promise<Customer> {
        try {
            console.log("[ICustomerRepository] fetchCustomer called with authUserId:", authUserId);
            const {data, error} = await (await this.getClient()).schema("store")
                .from("customers")
                .select("*")
                .eq("auth_user_id", authUserId)
                .maybeSingle();
            if (error) throw error;
            console.log("[ICustomerRepository] fetchCustomer result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in fetchCustomer:", error);
            throw error;
        }
    }

    async fetchMember(customerId: number): Promise<Member | null> {
        try {
            console.log("[ICustomerRepository] fetchMember called with customerId:", customerId);
            const {data, error} = await (await this.getClient()).schema("store")
                .from("members")
                .select("*")
                .eq("user_id", customerId)
                .maybeSingle();
            if (error) return null;
            console.log("[ICustomerRepository] fetchMember result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in fetchMember:", error);
            throw error;
        }
    }

    async fetchAllMembers(): Promise<Member[]> {
        try {
            console.log("[ICustomerRepository] fetchAllMembers called.");
            const {data, error} = await (await this.getClient()).schema("store")
                .from("members")
                .select("*");
            if (error) throw error;
            console.log("[ICustomerRepository] fetchAllMembers result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in fetchAllMembers:", error);
            throw error;
        }
    }

    async viewProfile(customerId: number): Promise<ProfileView> {
        try {
            console.log("[ICustomerRepository] viewProfile called with customerId:", customerId);
            const {
                data,
                error
            } = await (await this.getClient()).schema('store').from('profile_view').select('*').eq('id', customerId).single();
            if (error) throw error;
            console.log("[ICustomerRepository] viewProfile result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in viewProfile:", error);
            throw error;
        }
    }

    async getAllCustomers(): Promise<ProfileView[]> {
        try {
            console.log("[ICustomerRepository] getAllCustomers called.");
            const {data, error} = await (await this.getClient()).schema('store').from('profile_view').select('*');
            if (error) throw error;
            console.log("[ICustomerRepository] getAllCustomers result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in getAllCustomers:", error);
            throw error;
        }
    }

    async getAllMembers(): Promise<MemberView[]> {
        try {
            console.log("[ICustomerRepository] getAllMembers called.");
            const {data, error} = await (await this.getClient()).schema('admin').from('member_view').select('*');
            if (error) throw error;
            console.log("[ICustomerRepository] getAllMembers result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in getAllMembers:", error);
            throw error;
        }
    }

    async viewMember(memberId: number): Promise<MemberView> {
        try {
            console.log("[ICustomerRepository] viewMember called with memberId:", memberId);
            const {
                data,
                error
            } = await (await this.getClient()).schema('admin').from('member_view').select('*').eq('id', memberId).single();
            if (error) throw error;
            console.log("[ICustomerRepository] viewMember result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in viewMember:", error);
            throw error;
        }
    }

    private async getClient() {
        return createSupabaseServerClient();
    }
}
