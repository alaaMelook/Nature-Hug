import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";
import {Customer} from "@/domain/entities/auth/customer";

export class AddUpdatePhone {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(data: Partial<Customer>): Promise<void> {
        await this.repo.updateCustomerData(data);
    }

}