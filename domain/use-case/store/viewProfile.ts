import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

export class ViewProfile {
    constructor(private repo = new ICustomerServerRepository()) {
    }

    async execute(): Promise<ProfileView | null> {
        const user = await new GetCurrentUser().execute();
        if (!user) return null;
        return await this.repo.viewProfile(user.id);
    }

    async executeForAll(): Promise<ProfileView[]> {
        return await this.repo.getAllCustomers();
    }


} 