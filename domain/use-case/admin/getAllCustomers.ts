import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";
import {ProfileView} from "@/domain/entities/views/shop/profileView";

export class GetAllCustomers {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute({withoutMembers = false}: { withoutMembers?: boolean }): Promise<ProfileView[]> {
        try {
            console.log("[GetAllCustomers] execute called with withoutMembers:", withoutMembers);
            if (withoutMembers) {
                console.log("[GetAllCustomers] Calling fetchAllMembers.");
                let members = await this.repo.fetchAllMembers();
                console.log("[GetAllCustomers] fetchAllMembers result:", members);
                let memberIds = members.map(m => m.user_id);
                console.log("[GetAllCustomers] Calling getAllCustomers.");
                const customers = await this.repo.getAllCustomers();
                console.log("[GetAllCustomers] getAllCustomers result:", customers);
                return customers.filter(c => !memberIds.includes(c.id));
            }
            console.log("[GetAllCustomers] Calling getAllCustomers.");
            const customers = await this.repo.getAllCustomers();
            console.log("[GetAllCustomers] getAllCustomers result:", customers);
            return customers;
        } catch (error) {
            console.error("[GetAllCustomers] Error in execute:", error);
            throw error;
        }
    }
}