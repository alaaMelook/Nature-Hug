import { Review } from "../../database/review";

export interface ReviewAdminView extends Review {
    product_image: string;
    product_name_en: string;
    product_name_ar: string;
    customer_name: string;
}
