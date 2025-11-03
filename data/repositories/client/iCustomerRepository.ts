import {Member} from "@/domain/entities/auth/member";
import {Customer, CustomerAddress} from "@/domain/entities/auth/customer";
import {CustomerRepository} from "@/domain/repositories/customerRepository";
import {Session, User} from "@supabase/supabase-js";
import {ProfileView} from "@/domain/entities/views/shop/profileView";
import {MemberView} from "@/domain/entities/views/admin/memberView";
import {supabase} from "@/data/datasources/supabase/client";
import {Governorate} from "@/domain/entities/database/governorate";
import {Order} from "@/domain/entities/database/order";

export class ICustomerClientRepository implements CustomerRepository {

    async getSession(): Promise<Session | null> {
        try {
            console.log("[ICustomerRepository] getSession called.");
            const {data} = await supabase.auth.getSession();
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
            const {data} = await supabase.auth.getUser();
            console.log("[ICustomerRepository] getCurrentUser result:", data.user);
            return data.user;
        } catch (error) {
            console.error("[ICustomerRepository] Error in getCurrentUser:", error);
            throw error;
        }
    }

    async fetchCustomer(authUserId: string): Promise<Customer> {
        try {
            console.log("[ICustomerRepository] fetchCustomer called with authUserId:", authUserId);
            const {data} = await supabase.schema("store")
                .from("customers")
                .select("*")
                .eq("auth_user_id", authUserId)
                .maybeSingle();
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
            const {data} = await supabase.schema("store")
                .from("members")
                .select("*")
                .eq("user_id", customerId)
                .maybeSingle();
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
            const {data} = await supabase.schema("store")
                .from("members")
                .select("*");

            console.log("[ICustomerRepository] fetchAllMembers result:", data);
            return data || [];
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
            } = await supabase.schema('store').from('profile_view').select('*').eq('id', customerId).single();
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
            const {data} = await supabase.schema('store').from('profile_view').select('*');
            console.log("[ICustomerRepository] getAllCustomers result:", data);
            return data || [];
        } catch (error) {
            console.error("[ICustomerRepository] Error in getAllCustomers:", error);
            throw error;
        }
    }

    async getAllMembers(): Promise<MemberView[]> {
        try {
            console.log("[ICustomerRepository] getAllMembers called.");
            const {data} = await supabase.schema('admin').from('member_view').select('*');
            console.log("[ICustomerRepository] getAllMembers result:", data);
            return data || [];
        } catch (error) {
            console.error("[ICustomerRepository] Error in getAllMembers:", error);
            throw error;
        }
    }

    async viewMember(memberId: number): Promise<MemberView> {
        try {
            console.log("[ICustomerRepository] viewMember called with memberId:", memberId);
            const {
                data
            } = await supabase.schema('admin').from('member_view').select('*').eq('id', memberId).single();
            console.log("[ICustomerRepository] viewMember result:", data);
            return data;
        } catch (error) {
            console.error("[ICustomerRepository] Error in viewMember:", error);
            throw error;
        }
    }

    async fetchAllGovernorates(): Promise<Governorate[]> {
        try {
            console.log("[ICustomerRepository] fetchAllGovernorates called.");
            const {data} = await supabase.schema('store').from('shipping_governorates').select('*');
            console.log("[ICustomerRepository] fetchAllGovernorates result:", data);
            return data || [];
        } catch (error) {
            console.error("[ICustomerRepository] Error in fetchAllGovernorates:", error);
            throw error;
        }
    }

    async updateCustomerData(data: Partial<Customer>): Promise<void> {
        try {
            console.log("[ICustomerRepository] updateCustomerData called with data:", data);
            await supabase.schema('store').from('customers').update(data).eq('id', data.id);
            console.log("[ICustomerRepository] Customer data updated successfully.");
        } catch (error) {
            console.error("[ICustomerRepository] Error in updateCustomerData:", error);
            throw error;
        }
    }

    async updateCustomerAddress(address: Partial<CustomerAddress>): Promise<void> {
        try {
            console.log("[ICustomerRepository] updateCustomerAddress called with address:", address);
            await supabase.schema('store').from('customer_addresses').update(address).eq('id', address.id);
            console.log("[ICustomerRepository] Customer address updated successfully.");
        } catch (error) {
            console.error("[ICustomerRepository] Error in updateCustomerAddress:", error);
            throw error;
        }
    }

    async addCustomerAddress(address: Partial<CustomerAddress>): Promise<void> {
        try {
            console.log("[ICustomerRepository] addCustomerAddress called with address:", address);
            await supabase.schema('store').from('customer_addresses').insert(address);
            console.log("[ICustomerRepository] Customer address added successfully.");
        } catch (error) {
            console.error("[ICustomerRepository] Error in addCustomerAddress:", error);
            throw error;
        }
    }

    async deleteCustomerAddress(addressId: number): Promise<void> {
        try {
            console.log("[ICustomerRepository] deleteCustomerAddress called with addressId", addressId);
            const {
                error,
                status,
                statusText
            } = await supabase.schema('store').from('customer_addresses').delete().eq('id', addressId);
            if (error || status < 200 || status >= 300) {
                console.error(`Failed to delete customer address: ${error?.message || statusText}`);
            } else console.log("[ICustomerRepository] Customer address deleted successfully.");
        } catch (error) {
            console.error("[ICustomerRepository] Error in deleteCustomerAddress:", error);
            throw error;
        }
    }

    async createOrder(orderData: Order): Promise<void> {
        try {
            console.log("[IProductRepository] createOrder called with orderData:", orderData);
            await supabase.schema('store').rpc('create_full_order', {orderData: orderData});

            console.log("[IProductRepository] Order created successfully.");
        } catch (error) {
            console.error("[IProductRepository] Error in createOrder:", error);
            throw error;
        }
    }

    async createOrder(orderData: Order): Promise<void> {
        try {
            console.log("[IProductRepository] createOrder called with orderData:", orderData);
            await supabase.schema('store').rpc('create_guest_order', {orderData: orderData});

            console.log("[IProductRepository] Order created successfully.");
        } catch (error) {
            console.error("[IProductRepository] Error in createOrder:", error);
            throw error;
        }
    }
}
