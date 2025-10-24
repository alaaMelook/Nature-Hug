import { ICustomerRepository } from "@/data/repositories/iCustomerRepository";
import { Customer } from "@/domain/entities/auth/customer";

export class getCurrentUser {
    constructor() { }

    async execute(fromServer: boolean = false): Promise<Customer | null> {
        const repo = new ICustomerRepository(fromServer);
        const user = await repo.getCurrentUser();
        if (!user) throw new Error("User not found");
        return await repo.fetchCustomer(user.id);

    }

}