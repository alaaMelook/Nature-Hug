import { Member } from "@/domain/entities/auth/member";
import { Customer, CustomerAddress } from "@/domain/entities/auth/customer";
import { CustomerRepository } from "@/domain/repositories/customerRepository";
import { Session, User } from "@supabase/supabase-js";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { supabase } from "@/data/datasources/supabase/client";
import { Governorate } from "@/domain/entities/database/governorate";
import { Order } from "@/domain/entities/database/order";
import { OrderSummaryView } from "@/domain/entities/views/shop/orderSummaryView";

export class ICustomerClientRepository implements CustomerRepository {
    async viewOrder(OrderId: number, customerId: number): Promise<OrderSummaryView> {
        console.log("[ICustomerRepository] viewOrder called with OrderId:", OrderId, "customerId:", customerId);
        const { data, error } = await supabase.schema('store')
            .from('order_summary')
            .select('*')
            .eq('order_id', OrderId)
            .eq('customer_id', customerId)
            .maybeSingle();

        if (error) {
            console.error('[ICustomerRepository] viewOrder error:', error);
            throw error;
        }
        return data as OrderSummaryView;
    }

    async viewAllOrders(customerId: number): Promise<OrderSummaryView[]> {
        console.log("[ICustomerRepository] viewAllOrders called with customerId:", customerId);
        const { data, error } = await supabase.schema('store')
            .from('order_summary')
            .select('*')
            .eq('customer_id', customerId);

        if (error) {
            console.error('[ICustomerRepository] viewAllOrders error:', error);
            throw error;
        }
        return data || [];
    }

    async getSession(): Promise<Session | null> {
        console.log("[ICustomerRepository] getSession called.");
        const { data, error } = await supabase.auth.getSession();
        console.log("[ICustomerRepository] getSession result:", { data });
        if (error) {
            console.error("[ICustomerRepository] getSession error:", error);
            throw error;
        }
        return data.session;
    }

    async getCurrentUser(): Promise<User | null> {
        console.log("[ICustomerRepository] getCurrentUser called.");
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
            return null;
        }
        const user = await data.session.user;
        console.log("[ICustomerRepository] getCurrentUser result:", { data: user });
        if (user === null) {
            return null;
        }
        return user;
    }

    async fetchCustomer(authUserId: string): Promise<Customer> {
        console.log("[ICustomerRepository] fetchCustomer called with authUserId:", authUserId);
        const { data, status, statusText, error } = await supabase.schema("store")
            .from("customers")
            .select("*")
            .eq("auth_user_id", authUserId)
            .maybeSingle();
        console.log("[ICustomerRepository] fetchCustomer result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] fetchCustomer error:", error);
            throw error;
        }
        return data;
    }

    async fetchMember(customerId: number): Promise<Member | null> {
        console.log("[ICustomerRepository] fetchMember called with customerId:", customerId);
        const { data, status, statusText, error } = await supabase.schema("store")
            .from("members")
            .select("*")
            .eq("user_id", customerId)
            .maybeSingle();
        console.log("[ICustomerRepository] fetchMember result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] fetchMember error:", error);
            throw error;
        }
        return data;
    }

    async fetchAllMembers(): Promise<Member[]> {
        console.log("[ICustomerRepository] fetchAllMembers called.");
        const { data, status, statusText, error } = await supabase.schema("store")
            .from("members")
            .select("*");

        console.log("[ICustomerRepository] fetchAllMembers result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] fetchAllMembers error:", error);
            throw error;
        }
        return data || [];
    }

    async viewProfile(customerId: number): Promise<ProfileView> {
        console.log("[ICustomerRepository] viewProfile called with customerId:", customerId);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('profile_view').select('*').eq('id', customerId).single();
        console.log("[ICustomerRepository] viewProfile result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] viewProfile error:", error);
            throw error;
        }
        return data;
    }

    async getAllCustomers(): Promise<ProfileView[]> {
        console.log("[ICustomerRepository] getAllCustomers called.");
        const { data, status, statusText, error } = await supabase.schema('store').from('profile_view').select('*');
        console.log("[ICustomerRepository] getAllCustomers result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] getAllCustomers error:", error);
            throw error;
        }
        return data || [];
    }

    async getAllMembers(): Promise<MemberView[]> {
        console.log("[ICustomerRepository] getAllMembers called.");
        const { data, status, statusText, error } = await supabase.schema('admin').from('member_view').select('*');
        console.log("[ICustomerRepository] getAllMembers result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] getAllMembers error:", error);
            throw error;
        }
        return data || [];
    }

    async viewMember(memberId: number): Promise<MemberView> {
        console.log("[ICustomerRepository] viewMember called with memberId:", memberId);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('admin').from('member_view').select('*').eq('id', memberId).single();
        console.log("[ICustomerRepository] viewMember result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] viewMember error:", error);
            throw error;
        }
        return data;
    }

    async fetchAllGovernorates(): Promise<Governorate[]> {
        console.log("[ICustomerRepository] fetchAllGovernorates called.");
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('shipping_governorates').select('*');
        console.log("[ICustomerRepository] fetchAllGovernorates result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] fetchAllGovernorates error:", error);
            throw error;
        }
        return data || [];
    }

    async updateCustomerData(data: Partial<Customer>): Promise<void> {
        console.log("[ICustomerRepository] updateCustomerData called with data:", data);
        const {
            data: updated,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('customers').update(data).eq('id', data.id);
        console.log("[ICustomerRepository] updateCustomerData result:", { updated, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] updateCustomerData error:", error);
            throw error;
        }
    }

    async updateCustomerAddress(address: Partial<CustomerAddress>): Promise<void> {
        console.log("[ICustomerRepository] updateCustomerAddress called with address:", address);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('customer_addresses').update(address).eq('id', address.id);
        console.log("[ICustomerRepository] updateCustomerAddress result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] updateCustomerAddress error:", error);
            throw error;
        }
    }

    async addCustomerAddress(address: Partial<CustomerAddress>): Promise<void> {
        console.log("[ICustomerRepository] addCustomerAddress called with address:", address);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('customer_addresses').insert(address);
        console.log("[ICustomerRepository] addCustomerAddress result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] addCustomerAddress error:", error);
            throw error;
        }
    }

    async deleteCustomerAddress(addressId: number): Promise<void> {
        console.log("[ICustomerRepository] deleteCustomerAddress called with addressId", addressId);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('customer_addresses').delete().eq('id', addressId);
        console.log("[ICustomerRepository] deleteCustomerAddress result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] deleteCustomerAddress error:", error);
            throw error;
        }
    }

    async createOrder(orderData: Partial<Order>): Promise<{ order_id: number, customer_id: number }> {
        console.log("[ICustomerClientRepository] createOrder called with orderData:", orderData);
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').rpc('create_order', { order_data: orderData });
        console.log("[ICustomerClientRepository] createOrder result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerClientRepository] createOrder error:", error);
            throw error;
        }
        return data;
    }

    async addMember(member: Partial<Member>): Promise<void> {
        console.log("[ICustomerClientRepository] addMember called with member:", member);
        const { error } = await supabase.schema('store').from('members').insert(member);
        if (error) {
            console.error("[ICustomerClientRepository] addMember error:", error);
            throw error;
        }
    }
}
