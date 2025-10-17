import { CustomerAddress } from "@/domain/entities/database/customer";

export interface ProfileView {
    id: number;
    name: string;
    phone: string[];
    email: string;
    address?: CustomerAddress[];
    created_at: string;

}