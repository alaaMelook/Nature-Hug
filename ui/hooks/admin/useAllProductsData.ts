import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetAllProductsWithDetails, DeleteProduct } from '@/domain/use-case/admin/products';
import { useState } from "react";
import { ProductAdminView } from "@/domain/entities/views/admin/productAdminView";

export function useAllProductsData() {
    const [searchTerm, setSearchTerm] = useState(<string | null>null);
    const [products, setProducts] = useState<ProductAdminView[]>([]);

    const filteredProducts = () => {
        if (!products) {
            // noinspection BadExpressionStatementJS
            getAllProducts.data;
        }
        if (!searchTerm) return products;
        return products.filter(product =>
            product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.slug?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }



    const getAllProducts = useQuery({
        queryKey: ["allProductsWithDetails"],
        queryFn: async () => {
            const products = await new GetAllProductsWithDetails().execute()
            setProducts(products);
            return products;
        }
    });

    const deleteProduct = useMutation({
        mutationFn: (product: ProductAdminView) => new DeleteProduct().execute(product.slug!),
        onSuccess: () => useQueryClient().invalidateQueries({ queryKey: ["products"] }),
    });


    return {
        deleteProduct,
        searchTerm,
        setSearchTerm,
        getAllProducts: products ? { data: filteredProducts(), isPending: getAllProducts.isPending, isError: getAllProducts.isError } : getAllProducts,
    }
}
