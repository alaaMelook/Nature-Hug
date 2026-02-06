import { ICustomerServerRepository } from "@/data/repositories/server/iCustomerRepository";
import { GetCurrentUser } from "@/domain/use-case/store/getCurrentUser";

export class CancelOrder {
    constructor(private repo = new ICustomerServerRepository()) { }

    async execute(orderId: number): Promise<void> {
        // First try to get authenticated user
        const user = await new GetCurrentUser().execute();

        if (user) {
            // Authenticated user - cancel by customer ID
            await this.repo.cancelOrder(orderId, user.id);
            return;
        }

        // If no authenticated user, try anonymous session
        const sessionId = await new GetCurrentUser().getAnonymousSessionId();

        if (sessionId) {
            // Guest user - cancel by session ID
            await this.repo.cancelOrderBySession(orderId, sessionId);
            return;
        }

        // Neither authenticated nor guest session found
        throw new Error("Unable to verify order ownership. Please contact support.");
    }
}
