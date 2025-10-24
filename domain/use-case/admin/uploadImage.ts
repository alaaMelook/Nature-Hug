import { IProductRepository } from "@/data/repositories/iProductsRepository";

export class UploadImage {
    constructor(private repo = new IProductRepository()) { }
    async execute(file: File): Promise<string> {
        return await this.repo.uploadImage(file);
    }
}