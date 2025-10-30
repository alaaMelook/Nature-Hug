import {Member} from "@/domain/entities/auth/member";
import {ICustomerRepository} from "@/data/repositories/iCustomerRepository";
import {GetCurrentUser} from "@/domain/use-case/shop/getCurrentUser";

export class GetCurrentMember {
    constructor(private repo = new ICustomerRepository()) {

    }

    async execute(): Promise<Member | null> {
        const user = await new GetCurrentUser().execute();
        if (!user) return null;
        return await this.repo.fetchMember(user.id);

    }
}