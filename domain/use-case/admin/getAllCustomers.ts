import { ICustomerRepository } from "@/data/repositories/iCustomerRepository";
import { ProfileView } from "@/domain/entities/views/shop/profileView";

export class GetAllCustomers {
    constructor(private repo = new ICustomerRepository()) { }
    async execute({ withoutMembers = false }: { withoutMembers?: boolean }): Promise<ProfileView[]> {
        if (withoutMembers) {
            let members = await this.repo.fetchAllMembers();
            let memberIds = members.map(m => m.user_id);
            return (await this.repo.getAllCustomers()).filter(c => !memberIds.includes(c.id));
        }
        return await this.repo.getAllCustomers();
    }
}