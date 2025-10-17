import { IAuthRepository } from "@/data/repositories/iAuthRepository";
import { MemberView } from "@/domain/entities/views/admin/memberView";

export class ViewMember {
    constructor() { }

    async execute({ memberId, fromServer = false }: { memberId: number, fromServer?: boolean }): Promise<MemberView> {
        const repo = new IAuthRepository(fromServer);
        return await repo.viewMember(memberId);
    }
    async fromCustomerId({ customerId, fromServer = false }: { customerId: number, fromServer?: boolean }): Promise<MemberView> {
        const repo = new IAuthRepository(fromServer);
        const member = await repo.fetchMember(customerId);
        if (!member) throw new Error("Member not found");
        return await this.execute({ memberId: member.id, fromServer: fromServer });
    }

}