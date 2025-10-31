import {IProductServerRepository} from "@/data/repositories/server/iProductsRepository";

export class UploadImage {
    constructor(private repo = new IProductServerRepository()) {
    }

    async execute(file: File): Promise<string> {
        return await this.repo.uploadImage(file);
    }
}