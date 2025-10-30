import { IAdminRepository } from "@/data/repositories/iAdminRepository";
import { Material } from "@/domain/entities/database/material";

export class GetAllMaterials {
    constructor(private repo = new IAdminRepository()) { }

    async execute(): Promise<Material[]> {
        try {
            console.log("[GetAllMaterials] execute called.");
            console.log("[GetAllMaterials] Calling getAllMaterials.");
            const result = await this.repo.getAllMaterials();
            console.log("[GetAllMaterials] getAllMaterials result:", result);
            return result;
        } catch (error) {
            console.error("[GetAllMaterials] Error in execute:", error);
            throw error;
        }
    }
}
export class AddMaterial {
    constructor(private repo = new IAdminRepository()) { }

    async execute(material: Material): Promise<void> {
        try {
            console.log("[AddMaterial] execute called with material:", material);
            console.log("[AddMaterial] Calling addMaterial.");
            await this.repo.addMaterial(material);
            console.log("[AddMaterial] addMaterial completed.");
        } catch (error) {
            console.error("[AddMaterial] Error in execute:", error);
            throw error;
        }
    }
}
export class DeleteMaterial {
    constructor(private repo = new IAdminRepository()) { }

    async execute(id: number): Promise<void> {
        try {
            console.log("[DeleteMaterial] execute called with id:", id);
            console.log("[DeleteMaterial] Calling deleteMaterial.");
            await this.repo.deleteMaterial(id);
            console.log("[DeleteMaterial] deleteMaterial completed.");
        } catch (error) {
            console.error("[DeleteMaterial] Error in execute:", error);
            throw error;
        }
    }
}