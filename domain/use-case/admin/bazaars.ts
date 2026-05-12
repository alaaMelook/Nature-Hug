import { IAdminServerRepository } from "@/data/repositories/server/iAdminRepository";
import { Bazaar } from "@/domain/entities/database/bazaar";
import { BazaarExpense } from "@/domain/entities/database/bazaarExpense";

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

    async getReport(bazaarId: number, creatorCustomerId?: number) {
        try {
            return await this.repo.getBazaarReport(bazaarId, creatorCustomerId);
        } catch (error) {
            console.error("[Bazaars] getReport error:", error);
            throw error;
        }
    }

    // ===================== BAZAAR EXPENSES =====================

    async getExpenses(bazaarId: number) {
        try {
            return await this.repo.getBazaarExpenses(bazaarId);
        } catch (error) {
            console.error("[Bazaars] getExpenses error:", error);
            throw error;
        }
    }

    async addExpense(expense: Partial<BazaarExpense>) {
        try {
            return await this.repo.addBazaarExpense(expense);
        } catch (error) {
            console.error("[Bazaars] addExpense error:", error);
            throw error;
        }
    }

    async updateExpense(expense: Partial<BazaarExpense>) {
        try {
            return await this.repo.updateBazaarExpense(expense);
        } catch (error) {
            console.error("[Bazaars] updateExpense error:", error);
            throw error;
        }
    }

    async deleteExpense(id: number) {
        try {
            return await this.repo.deleteBazaarExpense(id);
        } catch (error) {
            console.error("[Bazaars] deleteExpense error:", error);
            throw error;
        }
    }
}

