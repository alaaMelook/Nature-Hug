import { ICustomerRepository } from "@/data/repositories/iCustomerRepository";
import { ProfileView } from "@/domain/entities/views/shop/profileView";

export class ViewProfile {
    constructor(private repo = new ICustomerRepository()) { }

    async execute(customerId: number): Promise<ProfileView | null> {
        return await this.repo.viewProfile(customerId);
    }
    async executeForAll(): Promise<ProfileView[]> {
        return await this.repo.getAllCustomers();
    }


} 