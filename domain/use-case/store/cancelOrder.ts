import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

export class CancelOrder {
    constructor(private repo = new ICustomerServerRepository()) { }

    async execute(orderId: number): Promise<void> {
        const user = await new GetCurrentUser().execute();
        if (!user) {
            throw new Error("User not authenticated");
        }


        await this.repo.cancelOrder(orderId, user.id);
    }
}
