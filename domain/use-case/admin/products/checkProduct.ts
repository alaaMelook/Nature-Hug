import { IProductServerRepository } from "@/data/repositories/server/iProductsRepository";

export class CheckProduct {
    constructor(private repo = new IProductServerRepository('ar')) { }

    async execute(slug: string): Promise<boolean> {
        try {
            console.log("[CheckProduct] execute called with:", slug);
            const id = await this.repo.checkSlug(slug);
            console.log("[CheckProduct] Product checked successfully.");
            return id;
        } catch (error) {
            console.error("[CheckProduct] Error checking product:", error);
            throw error;
        }
    }
}
