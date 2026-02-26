import { Member } from "@/domain/entities/auth/member";
import { Customer, CustomerAddress } from "@/domain/entities/auth/customer";
import { CustomerRepository } from "@/domain/repositories/customerRepository";
import { Session, User } from "@supabase/supabase-js";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";
import { Governorate } from "@/domain/entities/database/governorate";
import { Order } from "@/domain/entities/database/order";
import { OrderSummaryView } from "@/domain/entities/views/shop/orderSummaryView";

export class ICustomerServerRepository implements CustomerRepository {

    async getSession(): Promise<Session | null> {
        console.log("[ICustomerRepository] getSession called.");
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getSession();
        console.log("[ICustomerRepository] getSession result:", { data });
        if (error) {
            return null;
        }
        return data.session;
    }

    async getCurrentUser(): Promise<User | null> {
        console.log("[ICustomerRepository] getCurrentUser called.");
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.log("[ICustomerRepository] getCurrentUser no user found:", error);
            return null;
        }

        console.log("[ICustomerRepository] getCurrentUser result id:", user.id);
        return user;
    }

    async fetchCustomer(authUserId: string): Promise<Customer> {
        console.log("[ICustomerRepository] fetchCustomer called with authUserId:", authUserId);
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
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
    async fetchGovernorate(slug: string): Promise<Governorate> {
        console.log("[ICustomerRepository] fetchGovernorate called with slug:", slug);
        const supabase = await createSupabaseServerClient();
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('shipping_governorates').select('*').eq('slug', slug).single();
        console.log("[ICustomerRepository] fetchGovernorate result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] fetchGovernorate error:", error);
            throw error;
        }
        return data;
    }

    async updateCustomerData(data: Partial<Customer>): Promise<void> {
        const { id, ...updateData } = data;
        console.log("[ICustomerRepository] updateCustomerData called with data:", updateData);
        const supabase = await createSupabaseServerClient();
        const { data: updatedRows, status, statusText, error } = await supabase
            .schema('store')
            .from('customers')
            .update(updateData)
            .eq('id', data.id)
            .select(); // <--- ensure it returns rows
        console.log("[ICustomerRepository] update response:", { status, statusText, error, updatedRows });
        if (error) {
            console.error("[ICustomerRepository] updateCustomerData error:", error);
            throw error;
        }
        console.log("[ICustomerRepository] Customer data updated successfully.");
    }

    async deleteCustomerAddress(addressId: number): Promise<void> {
        console.log("[ICustomerRepository] deleteCustomerAddress called with addressId", addressId);
        const supabase = await createSupabaseServerClient();
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

    async updateCustomerAddress(address: Partial<CustomerAddress>): Promise<void> {
        console.log("[ICustomerRepository] updateCustomerAddress called with address:", address);
        const supabase = await createSupabaseServerClient();
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('customer_addresses').update(address).eq('customer_id', address.customer_id);
        console.log("[ICustomerRepository] updateCustomerAddress result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] updateCustomerAddress error:", error);
            throw error;
        }
        console.log("[ICustomerRepository] Customer address updated successfully.");
    }

    async addCustomerAddress(address: Partial<CustomerAddress>): Promise<void> {
        console.log("[ICustomerRepository] addCustomerAddress called with address:", address);
        const supabase = await createSupabaseServerClient();
        const {
            data,
            error,
            status,
            statusText
        } = await supabase.schema('store').from('customer_addresses').insert(address);
        console.log("[ICustomerRepository] addCustomerAddress result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] addCustomerAddress error:", error);
            throw error;
        }
        console.log("[ICustomerRepository] Customer address added successfully.");
    }

    async createOrder(orderData: Partial<Order>): Promise<{ order_id: number, customer_id: number }> {
        console.log("[ICustomerServerRepository] createOrder called with orderData:", orderData);
        const supabase = await createSupabaseServerClient();
        const {
            data,
            error,
            status,
            statusText
        } = await supabase.schema('store').rpc('create_order', { order_data: orderData });
        console.log("[ICustomerServerRepository] createOrder result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerServerRepository] createOrder error:", error);
            throw error;
        }
        return data;
    }

    async addMember(member: Partial<Member>): Promise<void> {
        console.log("[ICustomerServerRepository] addMember called with member:", member);
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.schema('store').from('members').insert(member);
        if (error) {
            console.error("[ICustomerServerRepository] addMember error:", error);
            throw error;
        }
    }

    async updateMember(member: Partial<Member>): Promise<void> {
        console.log("[ICustomerServerRepository] updateMember called with member:", member);
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.schema('store').from('members').update(member).eq('user_id', member.user_id);
        if (error) {
            console.error("[ICustomerServerRepository] updateMember error:", error);
            throw error;
        }
    }

    async removeMember(customerId: number): Promise<void> {
        console.log("[ICustomerServerRepository] removeMember called with customerId:", customerId);
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.schema('store').from('members').delete().eq('user_id', customerId);
        if (error) {
            console.error("[ICustomerServerRepository] removeMember error:", error);
            throw error;
        }
    }

    async getMemberPermissions(memberId: number): Promise<string[]> {
        console.log("[ICustomerServerRepository] getMemberPermissions called with memberId:", memberId);
        const { supabaseAdmin } = await import("@/data/datasources/supabase/admin");
        const { data, error } = await supabaseAdmin.schema('store')
            .from('member_permissions')
            .select('permission')
            .eq('member_id', memberId);
        if (error) {
            console.error("[ICustomerServerRepository] getMemberPermissions error:", error);
            throw error;
        }
        return (data || []).map((row: any) => row.permission);
    }

    async setMemberPermissions(memberId: number, permissions: string[]): Promise<void> {
        console.log("[ICustomerServerRepository] setMemberPermissions called:", { memberId, permissions });
        const { supabaseAdmin } = await import("@/data/datasources/supabase/admin");

        // Delete existing permissions
        const { error: deleteError } = await supabaseAdmin.schema('store')
            .from('member_permissions')
            .delete()
            .eq('member_id', memberId);
        if (deleteError) {
            console.error("[ICustomerServerRepository] delete permissions error:", deleteError);
            throw deleteError;
        }

        // Insert new permissions
        if (permissions.length > 0) {
            const rows = permissions.map(p => ({ member_id: memberId, permission: p }));
            const { error: insertError } = await supabaseAdmin.schema('store')
                .from('member_permissions')
                .insert(rows);
            if (insertError) {
                console.error("[ICustomerServerRepository] insert permissions error:", insertError);
                throw insertError;
            }
        }
    }



    async viewAllOrders(customerId: number): Promise<OrderSummaryView[]> {
        console.log("[ICustomerRepository] viewAllOrders called with customerId:", customerId);
        const supabase = await createSupabaseServerClient();
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('order_summary').select('*').eq('customer_id', customerId);
        console.log("[ICustomerRepository] viewAllOrders result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] viewAllOrders error:", error);
            throw error;
        }
        return data || [];
    }

    async viewOrder(orderId: number, customerId?: number): Promise<OrderSummaryView> {
        console.log("[ICustomerRepository] viewAllOrders called with orderId:", orderId);
        const supabase = await createSupabaseServerClient();
        const {
            data,
            status,
            statusText,
            error
        } = await supabase.schema('store').from('order_summary').select('*').eq('order_id', orderId).eq('customer_id', customerId).maybeSingle();
        console.log("[ICustomerRepository] viewAllOrders result:", { data, status, statusText });
        if (error) {
            console.error("[ICustomerRepository] viewAllOrders error:", error);
            throw error;
        }
        return data;
    }

    async cancelOrder(orderId: number, customerId: number): Promise<void> {
        console.log(`[ICustomerRepository] cancelOrder called for order ${orderId} by customer ${customerId}`);
        const supabase = await createSupabaseServerClient();

        // Restore stock before cancelling
        const { restoreOrderStock, restorePackagingForOrder } = await import("@/lib/services/stockService");
        await restoreOrderStock(orderId);
        await restorePackagingForOrder(orderId);

        const { error } = await supabase.schema('store')
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('customer_id', customerId)
            .in('status', ['pending', 'processing']);

        if (error) {
            console.error("[ICustomerRepository] cancelOrder error:", error);
            throw error;
        }
    }

    async cancelOrderBySession(orderId: number, sessionId: string): Promise<void> {
        console.log(`[ICustomerRepository] cancelOrderBySession called for order ${orderId} by session ${sessionId}`);
        const supabase = await createSupabaseServerClient();

        // Restore stock before cancelling
        const { restoreOrderStock, restorePackagingForOrder } = await import("@/lib/services/stockService");
        await restoreOrderStock(orderId);
        await restorePackagingForOrder(orderId);

        const { error } = await supabase.schema('store')
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('session_id', sessionId)
            .in('status', ['pending', 'processing']);

        if (error) {
            console.error("[ICustomerRepository] cancelOrderBySession error:", error);
            throw error;
        }
    }
}
