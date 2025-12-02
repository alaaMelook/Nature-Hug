"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Plus, Trash2, Search, Filter, PlusCircle } from "lucide-react";
import { Material } from "@/domain/entities/database/material";
import { deleteMaterial } from "@/ui/hooks/admin/useMaterials";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { StockUpdateModal } from "./stockUpdateModal";
import { addStockAction } from "@/ui/hooks/admin/inventory";

export function MaterialsTable({
  initialMaterials,
}: {
  initialMaterials: Material[];
}) {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>(initialMaterials || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const router = useRouter();

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materials, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm") || "Are you sure you want to delete this material?")) return;
    try {
      const result = await deleteMaterial(id);
      if (result?.error === "DELETE_RESTRICTED") {
        toast.error(t("materialInUse") || "Material is in use and cannot be deleted");
      } else if (result?.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        toast.success(t("deleteSuccess") || "Material deleted successfully");
      } else {
        toast.error(t("deleteFailed") || "Failed to delete material");
      }
    } catch (error) {
      console.error("Failed to delete material:", error);
      toast.error(t("deleteFailed") || "Failed to delete material");
    }
  };

  const handleOpenStockModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsStockModalOpen(true);
  };

  const handleAddStock = async (quantity: number) => {
    if (!selectedMaterial) return;

    const result = await addStockAction('material', selectedMaterial, quantity);

    if (result.success) {
      toast.success(t("stockAdded") || "Stock added successfully");
      // Optimistic update
      setMaterials(prev => prev.map(m =>
        m.id === selectedMaterial.id
          ? { ...m, stock_grams: (m.stock_grams || 0) + quantity }
          : m
      ));
    } else {
      toast.error(result.error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name", headerName: t("materialName") || "Name", flex: 1, minWidth: 150,
      renderCell: (params) => <span className="font-medium text-center">{params.row.name || "-"}</span>,
    },
    {
      field: "unit",
      headerName: t("unit") || "Unit",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => <span className="font-medium text-center">{params.row.unit || "-"}</span>,
    },
    {
      field: "price_per_gram",
      headerName: t("pricePerUnit") || "Price/unit",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className="font-medium text-center">
          {t('{{price,currency}}', { price: params.row.price_per_gram })}/{params.row.unit || 'g'}
        </span>
      )
    },
    {
      field: "stock_grams",
      headerName: t("stockUnits") || "Stock",
      flex: 1,
      minWidth: 140,
      // renderCell: (params) => <span className="font-medium text-center">{params.row.stock_grams || "-"}</span>,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(params.row.stock_grams || 0) > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {params.row.stock_grams} {t("g")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenStockModal(params.row as Material);
            }}
            className="p-1 hover:bg-gray-100 rounded-full text-primary-600 transition-colors"
            title={t("addStock") || "Add Stock"}
          >
            <PlusCircle size={18} />
          </button>
        </div>
      )
    },
    {
      field: "material_type",
      headerName: t("materialType") || "Type",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "actions",
      headerName: t("actions") || "Actions",
      sortable: false,
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <div className="space-x-2">

          <button
            onClick={() => handleDelete((params.row as Material).id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4 inline" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("materials") || "Materials"}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("manageMaterials") || "Manage raw materials inventory"}</p>
        </div>
        <button
          onClick={() => router.push("/admin/materials/create")}
          className="flex items-center justify-center px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 focus:ring-4 focus:ring-amber-100 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mx-2" /> {t("addMaterial") || "Add Material"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchMaterials") || "Search materials..."}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4 mx-2 text-gray-500" />
            {t("filter") || "Filter"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="md:bg-white rounded-xl md:shadow-sm md:border border-gray-200 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block" style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredMaterials}
            columns={columns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            className="border-none"
          />
        </div>

        {/* Mobile View */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t("noMaterialsFound") || "No materials found"}
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className=" p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">{material.name}</h3>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>{t("unit") || "Unit"}:</span>
                    <span className="font-medium">{material.unit || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("type") || "Type"}:</span>
                    <span className="font-medium">{material.material_type || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900">{t('{{price,currency}}', { price: material.price_per_gram })}/{material.unit}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full ${(material.stock_grams || 0) > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {material.stock_grams} {t("g")}
                      </span>
                      <button
                        onClick={() => handleOpenStockModal(material)}
                        className="p-1 text-primary-600 bg-primary-50 rounded-full"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onConfirm={handleAddStock}
        title={t("addMaterialStock") || "Add Material Stock"}
        itemName={selectedMaterial?.name || ""}
        currentStock={selectedMaterial?.stock_grams}
      />

    </div>
  );
}
