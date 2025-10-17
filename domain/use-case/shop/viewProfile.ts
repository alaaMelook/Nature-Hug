import { IAuthRepository } from "@/data/repositories/iAuthRepository";
import { ProfileView } from "@/domain/entities/views/shop/profileView";

export class ViewProfile {
    constructor(private repo = new IAuthRepository()) { }

    async execute(customerId: number): Promise<ProfileView | null> {
        return await this.repo.viewProfile(customerId);
    }

} 