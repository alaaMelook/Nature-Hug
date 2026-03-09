import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Bazaar } from "@/domain/entities/database/bazaar";

export class Bazaars {
    constructor(private repo = new IAdminServerRepository()) {
    }

    async getAll() {
        try {
            return await this.repo.getAllBazaars();
        } catch (error) {
            console.error("[Bazaars] getAll error:", error);
            throw error;
        }
    }

    async getAllWithStats() {
        try {
            return await this.repo.getAllBazaarsWithStats();
        } catch (error) {
            console.error("[Bazaars] getAllWithStats error:", error);
            throw error;
        }
    }

    async getById(id: number) {
        try {
            return await this.repo.getBazaarById(id);
        } catch (error) {
            console.error("[Bazaars] getById error:", error);
            throw error;
        }
    }

    async create(bazaar: Partial<Bazaar>) {
        try {
            return await this.repo.createBazaar(bazaar);
        } catch (error) {
            console.error("[Bazaars] create error:", error);
            throw error;
        }
    }

    async update(bazaar: Partial<Bazaar>) {
        try {
            return await this.repo.updateBazaar(bazaar);
        } catch (error) {
            console.error("[Bazaars] update error:", error);
            throw error;
        }
    }

    async delete(id: number) {
        try {
            return await this.repo.deleteBazaar(id);
        } catch (error) {
            console.error("[Bazaars] delete error:", error);
            throw error;
        }
    }

    async getOrders(bazaarId: number) {
        try {
            return await this.repo.getBazaarOrders(bazaarId);
        } catch (error) {
            console.error("[Bazaars] getOrders error:", error);
            throw error;
        }
    }

    async getReport(bazaarId: number) {
        try {
            return await this.repo.getBazaarReport(bazaarId);
        } catch (error) {
            console.error("[Bazaars] getReport error:", error);
            throw error;
        }
    }
}
