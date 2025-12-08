'use client';
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Plus, Trash2, Search, Filter, PlusCircle, Check, X, ChevronDown } from "lucide-react";
import { Material } from "@/domain/entities/database/material";
import { deleteMaterial } from "@/ui/hooks/admin/useMaterials";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { StockUpdateModal } from "./stockUpdateModal";
import { addStockAction } from "@/ui/hooks/admin/inventory";
import { motion, AnimatePresence } from "framer-motion";

export function MaterialsTable({
  initialMaterials,
}: {
  initialMaterials: Material[];
}) {
  const { t, i18n } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>(initialMaterials || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<number | "">("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Filter UI State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hardcoded material types
  const materialTypes = ['Chemicals', 'Labels', 'Containers', 'Packaging', 'Others'];

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // 1. Name Filter
      const matchesName = material.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Price Filter (Max Price)
      const matchesPrice = priceFilter === "" || (material.price_per_gram <= priceFilter);

      // 3. Type Filter
      const matchesType = typeFilter ? material.material_type?.toLowerCase() === typeFilter.toLowerCase() : true;

      // 4. Stock Filter
      let matchesStock = true;
      if (stockFilter === "in_stock") {
        matchesStock = (material.stock_grams || 0) > 0;
      } else if (stockFilter === "out_of_stock") {
        matchesStock = (material.stock_grams || 0) <= 0;
      } else if (stockFilter === "low_stock") {
        matchesStock = (material.stock_grams || 0) <= (material.low_stock_threshold || 10); // Default threshold 10 if null
      }

      return matchesName && matchesPrice && matchesType && matchesStock;
    });
  }, [materials, searchTerm, priceFilter, typeFilter, stockFilter]);

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

  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter("");
    setTypeFilter(null);
    setStockFilter("all");
    setIsFilterOpen(false);
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

  const activeFiltersCount = (typeFilter ? 1 : 0) + (stockFilter !== 'all' ? 1 : 0) + (priceFilter !== "" ? 1 : 0);

  const columns: GridColDef[] = [
    {
      field: "name", headerName: t("materialName") || "Name", flex: 1, minWidth: 150,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: "unit", headerName: t("unit") || "Unit", flex: 0.5, minWidth: 100,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: "price_per_gram",
      headerName: t("pricePerUnit") || "Price/unit",
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span>
          {t('{{price,currency}}', { price: params.row.price_per_gram })}/{params.row.unit || 'g'}
        </span>
      )
    },
    {
      field: "stock_grams",
      headerName: t("stockUnits") || "Stock",
      flex: 1,
      minWidth: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(params.row.stock_grams || 0) > params.row.low_stock_threshold ? 'bg-green-100 text-green-700' : (params.row.stock_grams || 0) <= params.row.low_stock_threshold && (params.row.stock_grams || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
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
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "actions",
      headerName: t("actions") || "Actions",
      sortable: false,
      flex: 0.5,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <button
          onClick={() => handleDelete((params.row as Material).id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center relative">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchMaterials")}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors w-full sm:w-auto ${isFilterOpen || activeFiltersCount > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4 mx-2" />
            {t("filter")}
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className={`absolute ${i18n.dir() === 'rtl' ? 'left-0' : 'right-0'} top-2 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 origin-top-right z-1`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">{t("filters")}</h3>
                    {(typeFilter || stockFilter !== 'all' || priceFilter !== "") && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center"
                      >
                        <X className="w-3 h-3 mr-1" />
                        {t("clearAll")}
                      </button>
                    )}
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{t("stockStatus") || "Stock Status"}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'all', label: t("all") || "All" },
                        { id: 'in_stock', label: t("inStock") || "In Stock" },
                        { id: 'low_stock', label: t("lowStock") || "Low Stock" },
                        { id: 'out_of_stock', label: t("outOfStock") || "Out of Stock" }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setStockFilter(option.id as any)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center border ${stockFilter === option.id
                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                            : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{t("materialType") || "Material Type"}</label>
                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                      <button
                        onClick={() => setTypeFilter(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${typeFilter === null ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <span>{t("allTypes") || "All Types"}</span>
                        {typeFilter === null && <Check className="w-3 h-3" />}
                      </button>
                      {materialTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setTypeFilter(type)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${typeFilter === type ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <span>{type}</span>
                          {typeFilter === type && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{t("maxPrice") || "Max Price"}</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value === "" ? "" : Number(e.target.value))}
                      min={0}
                    />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ height: 600, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <DataGrid
          rows={filteredMaterials}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        />
      </div>

      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onConfirm={handleAddStock}
        title={t("addMaterialStock")}
        itemName={selectedMaterial?.name || ""}
        currentStock={selectedMaterial?.stock_grams}
      />
    </div>
  );
}
