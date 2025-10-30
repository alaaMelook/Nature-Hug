import {ICustomerRepository} from "@/data/repositories/iCustomerRepository";
import {MemberView} from "@/domain/entities/views/admin/memberView";

export class ViewMember {
    constructor() {
    }

    async execute({memberId}: { memberId: number }): Promise<MemberView> {
        try {
            console.log("[ViewMember] execute called with memberId:", memberId);
            const repo = new ICustomerRepository();
            console.log("[ViewMember] Calling viewMember.");
            const result = await repo.viewMember(memberId);
            console.log("[ViewMember] viewMember result:", result);
            return result;
        } catch (error) {
            console.error("[ViewMember] Error in execute:", error);
            throw error;
        }
    }

    async fromCustomerId({customerId}: { customerId: number }): Promise<MemberView> {
        try {
            console.log("[ViewMember] fromCustomerId called with customerId:", customerId);
            const repo = new ICustomerRepository();
            console.log("[ViewMember] Calling fetchMember.");
            const member = await repo.fetchMember(customerId);
            console.log("[ViewMember] fetchMember result:", member);
            if (!member) throw new Error("Member not found");
            return await this.execute({memberId: member.id});
        } catch (error) {
            console.error("[ViewMember] Error in fromCustomerId:", error);
            throw error;
        }
    }

}