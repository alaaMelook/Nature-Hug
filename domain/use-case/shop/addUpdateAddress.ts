import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";
import {CustomerAddress} from "@/domain/entities/auth/customer";

export class AddUpdateAddress {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async update(address: Partial<CustomerAddress>): Promise<void> {
        await this.repo.updateCustomerAddress(address);
    }

    async add(address: Partial<CustomerAddress>): Promise<void> {
        await this.repo.addCustomerAddress(address);
    }

}