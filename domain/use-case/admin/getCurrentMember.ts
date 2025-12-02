import { Member } from "@/domain/entities/auth/member";
import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

export class GetCurrentMember {
    constructor(private repo = new ICustomerServerRepository()) {

    }

    async execute(): Promise<Member | null> {
        const user = await new GetCurrentUser().execute();
        if (!user) return null;
        return await this.repo.fetchMember(user.id);

    }
}