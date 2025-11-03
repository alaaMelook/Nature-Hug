import {Customer, CustomerAddress} from "@/domain/entities/auth/customer";
import {Member} from "@/domain/entities/auth/member";
import {Session, User} from "@supabase/supabase-js";
import {ProfileView} from "@/domain/entities/views/shop/profileView";
import {MemberView} from "@/domain/entities/views/admin/memberView";
import {Governorate} from "@/domain/entities/database/governorate";
import {Order} from "@/domain/entities/database/order";
import {OrderSummaryView} from "@/domain/entities/views/shop/orderSummaryView";

export interface CustomerRepository {
    fetchAllGovernorates(): Promise<Governorate[]>;

    getSession(): Promise<Session | null>;

    getCurrentUser(): Promise<User | null>;

    updateCustomerData(data: Partial<Customer>): Promise<void>;

    addCustomerAddress(address: Partial<CustomerAddress>): Promise<void>;

    updateCustomerAddress(address: Partial<CustomerAddress>): Promise<void>;

    deleteCustomerAddress(addressId: number): Promise<void>

    fetchCustomer(authUserId: string): Promise<Customer>; // Stays here as it links auth user to customer
    fetchMember(customerId: number): Promise<Member | null>; // This could move to a future MemberRepository
    fetchAllMembers(): Promise<Member[]>; // This could move to a future MemberRepository
    getAllCustomers(): Promise<ProfileView[]>; // Should move to a new CustomerRepository
    getAllMembers(): Promise<MemberView[]>; // Should move to a new MemberRepository
    viewProfile(customerId: number): Promise<ProfileView>; // Should move to a new CustomerRepository
    viewMember(memberId: number): Promise<MemberView>;

    viewOrder(OrderId: number, customerId: number): Promise<OrderSummaryView>; // Should move to a new OrderRepository
    viewAllOrders(customerId: number): Promise<OrderSummaryView[]>; // Should move to a new OrderRepository
    createOrder(orderData: Partial<Order>): Promise<number>;
}

