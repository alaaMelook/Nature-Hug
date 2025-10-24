import { IAdminRepository } from "@/data/repositories/iAdminRepository";
import { Material } from "@/domain/entities/database/material";

export class GetAllMaterials {
    constructor(private repo = new IAdminRepository()) { }

    async execute(): Promise<Material[]> {
        return await this.repo.getAllMaterials();
    }
}
export class AddMaterial {
    constructor(private repo = new IAdminRepository()) { }

    async execute(material: Material): Promise<void> {
        return await this.repo.addMaterial(material);
    }
}
export class DeleteMaterial {
    constructor(private repo = new IAdminRepository()) { }

    async execute(id: number): Promise<void> {
        return await this.repo.deleteMaterial(id);
    }
}