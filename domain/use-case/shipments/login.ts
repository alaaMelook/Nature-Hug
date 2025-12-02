import { shipmentService } from "@/lib/services/shipmentService";

export class Login {
    async execute(): Promise<void> {
        await shipmentService.ensureAuth();
    }
}
