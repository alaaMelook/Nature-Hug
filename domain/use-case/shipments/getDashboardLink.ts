import { shipmentService } from "@/lib/services/shipmentService";

export class GetDashboardLink {
    async execute(): Promise<string | null> {
        return await shipmentService.getDashboardLink();
    }
}
