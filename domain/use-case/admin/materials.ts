import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Material } from "@/domain/entities/database/material";

export class GetAllMaterials {
    constructor(private repo = new IAdminServerRepository()) {
    }

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
    constructor(private repo = new IAdminServerRepository()) {
    }

    async execute(material: Partial<Material>): Promise<void> {
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
    constructor(private repo = new IAdminServerRepository()) {
    }

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
export class UpdateMaterial {
    constructor(private repo = new IAdminServerRepository()) { }
    async execute(material: Partial<Material>): Promise<void> {
        try {
            console.log("[UpdateMaterial] execute called with material:", material);
            console.log("[UpdateMaterial] Calling updateMaterial.");
            await this.repo.updateMaterial(material);
            console.log("[UpdateMaterial] updateMaterial completed.");
        } catch (error) {
            console.error("[UpdateMaterial] Error in execute:", error);
            throw error;
        }
    }
}