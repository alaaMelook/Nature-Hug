import { Customer } from "@/domain/entities/auth/customer";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { UUID } from "crypto";

export class GetCurrentUser {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(): Promise<Customer | null> {
        try {
            console.log("[getCurrentUser] execute called with fromServer:");

            const user = await this.repo.getCurrentUser();
            if (user?.is_anonymous === false) {
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
    async getAnonymousSessionId(): Promise<string | null> {
        const user = await this.repo.getCurrentUser();
        if (user?.is_anonymous) {
            return user.id;
        }
        return null;
    }

}