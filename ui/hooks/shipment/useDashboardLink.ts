import { GetDashboardLink } from "@/domain/use-case/shipments/getDashboardLink";

export function useDashboardLink() {
    return new GetDashboardLink().execute();
}