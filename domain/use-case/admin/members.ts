import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

export class ViewMember {
    constructor() {
    }

    async execute({ memberId }: { memberId: number }): Promise<MemberView> {
        try {
            console.log("[ViewMember] execute called with memberId:", memberId);
            const repo = new ICustomerServerRepository();
            console.log("[ViewMember] Calling viewMember.");
            const result = await repo.viewMember(memberId);
            console.log("[ViewMember] viewMember result:", result);
            return result;
        } catch (error) {
            console.error("[ViewMember] Error in execute:", error);
            throw error;
        }
    }

    async fromCustomerId({ customerId }: { customerId: number }): Promise<MemberView | null> {
        try {
            console.log("[ViewMember] fromCustomerId called with customerId:", customerId);

            // Directly query members table with customer join to ensure permissions are included
            const supabase = await createSupabaseServerClient();

            const { data: member, error } = await supabase.schema('store')
                .from('members')
                .select(`
                    id,
                    user_id,
                    role,
                    permissions,
                    created_at,
                    customers:user_id (
                        id,
                        name,
                        email,
                        phone
                    )
                `)
                .eq('user_id', customerId)
                .maybeSingle();

            console.log("[ViewMember] fromCustomerId member result:", member);

            if (error) {
                console.error("[ViewMember] fromCustomerId error:", error);
                throw error;
            }

            if (!member) {
                console.log("[ViewMember] No member found for customerId:", customerId);
                return null;
            }

            // Transform to MemberView format
            const customer = member.customers as any;
            const memberView: MemberView = {
                id: member.id,
                name: customer?.name || '',
                email: customer?.email || '',
                role: member.role,
                permissions: member.permissions,
                created_at: member.created_at,
                phone: customer?.phone,
                customer_id: member.user_id
            };

            console.log("[ViewMember] fromCustomerId returning:", memberView);
            return memberView;
        } catch (error) {
            console.error("[ViewMember] Error in fromCustomerId:", error);
            throw error;
        }
    }
}
