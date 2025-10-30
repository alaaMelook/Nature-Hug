import {ICustomerRepository} from "@/data/repositories/iCustomerRepository";
import {Customer} from "@/domain/entities/auth/customer";

export class GetCurrentUser {
    constructor(private repo = new ICustomerRepository()) {
    }

    async execute(): Promise<Customer | null> {
        try {
            console.log("[getCurrentUser] execute called with fromServer:");

            const user = await this.repo.getCurrentUser();
            if (user) {
                const customer = await this.repo.fetchCustomer(user.id);
                console.log("[getCurrentUser] fetchCustomer result:", customer);
                return customer;
            }
            return null;
        } catch (error) {
            console.error("[getCurrentUser] Error in execute:", error);
            throw error;
        }
    }

}