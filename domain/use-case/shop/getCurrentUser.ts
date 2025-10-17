import { IAuthRepository } from "@/data/repositories/iAuthRepository";
import { Customer } from "@/domain/entities/database/customer";

export class getCurrentUser {
    constructor() { }

    async execute(fromServer: boolean = false): Promise<Customer | null> {
        const repo = new IAuthRepository(fromServer);
        const user = await repo.getCurrentUser();
        if (!user) throw new Error("User not found");
        return await repo.fetchCustomer(user.id);

    }

}