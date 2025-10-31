import {ICustomerServerRepository} from "@/data/repositories/server/iCustomerRepository";

export class DeleteAddress {
    constructor(private repo = new ICustomerServerRepository) {
    }

    async execute(addressId: number): Promise<void> {
        try {
            await this.repo.deleteCustomerAddress(addressId);
        } catch (error) {
            console.error(error);
            throw error;
        }

    }
}