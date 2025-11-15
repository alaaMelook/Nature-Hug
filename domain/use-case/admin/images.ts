import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";

export class UploadImage {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(file: File): Promise<string> {
        return await this.repo.uploadImage(file);
    }
}

export class GetAllImages {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(): Promise<{ image: any, url: string }[]> {
        return await this.repo.getAllImages();
    }
}

export class DeleteImage {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(imageName: string): Promise<void> {
        return await this.repo.deleteImage(imageName);
    }
}

export class uploadBulkImages {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(images: File[]): Promise<void> {
        for (const image of images) {
            await this.repo.uploadImage(image);
        }

    }
}