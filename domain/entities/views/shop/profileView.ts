import {Governorate} from "@/domain/entities/database/governorate";

export interface ProfileView {
    id: number;
    name: string;
    phone: string[];
    email: string;
    address?: ViewAddress[];
    created_at: string;

}

export interface ViewAddress {
    id: number;
    customer_id: number;
    address: string;
    governorate: Governorate;
    created_at: string;
}