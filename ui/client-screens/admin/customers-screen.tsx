'use client';

import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { Search, Mail, Phone, Calendar, User, MapPin, UserCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export function CustomersScreen({ allCustomers }: { allCustomers: ProfileView[] | undefined }) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        search: "",
        excludeMembers: true,
        customerType: "all" as "all" | "withAccount" | "guestOnly",
    });
    const [customers, setCustomers] = useState(allCustomers);

    // Check if customer has an account vs guest (made order without account)
    // Uses has_account field from database if available, otherwise falls back to email check
    const hasAccount = (customer: ProfileView) => {
        // If has_account is explicitly set, use it
        if (customer.has_account !== undefined) {
            return customer.has_account;
        }
        // Fallback: check if they have an email (registered users typically have email)
        return !!(customer.email && customer.email.trim() !== "");
    };

    // Filter out "Unknown" customers with no useful data
    const isValidCustomer = (customer: ProfileView) => {
        const hasName = customer.name && customer.name.trim() !== "" && customer.name !== "Unknown";
        const hasEmail = customer.email && customer.email.trim() !== "";
        const hasOrders = (customer.total_orders ?? 0) > 0;
        const hasPhone = customer.phone && customer.phone.some(p => p && p.trim() !== "");
        // Customer is valid if they have orders, or have (name or email) and orders/phone
        // Show ONLY customers with orders OR customers with accounts
        return hasOrders || hasEmail;
    };

    useEffect(() => {
        let filtered = allCustomers?.filter(isValidCustomer) || [];

        // Filter by exclude members
        if (filters.excludeMembers) {
            filtered = filtered.filter((customer) => customer.role === null);
        }

        // Filter by customer type
        if (filters.customerType === "withAccount") {
            filtered = filtered.filter(hasAccount);
        } else if (filters.customerType === "guestOnly") {
            filtered = filtered.filter(c => !hasAccount(c));
        }

        // Apply search filter
        if (filters.search) {
            const searchValue = filters.search.toLowerCase();
            filtered = filtered.filter((customer: ProfileView) => {
                if (customer.name && customer.name.toLowerCase().includes(searchValue)) return true;
                if (customer.email && customer.email.toLowerCase().includes(searchValue)) return true;
                if (customer.phone?.some(p => p?.toLowerCase().includes(searchValue))) return true;
                return false;
            });
        }

        // Sort by created_at (newest first)
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setCustomers(filtered);
    }, [filters.excludeMembers, filters.customerType, filters.search, allCustomers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value });
    };

    const columns: GridColDef[] = [
        {
            field: "customer",
            headerName: t("customer"),
            flex: 2,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center h-full">
                    <div className="flex-shrink-0 h-10 w-10 mx-4">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                            {params.row.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {params.row.name || t("guest") || "Guest"}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            #{params.row.id}
                        </div>
                    </div>
                </div>
            )
        },
        {
            field: "customerType",
            headerName: t("type") || "Type",
            flex: 1,
            minWidth: 130,
            renderCell: (params: GridRenderCellParams) => {
                const isRegistered = hasAccount(params.row);
                return (
                    <div className="flex items-center h-full">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${isRegistered
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-orange-100 text-orange-800"
                            }`}>
                            {isRegistered ? (
                                <>
                                    <UserCheck className="h-3 w-3" />
                                    {t("registered") || "Registered"}
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="h-3 w-3" />
                                    {t("guestOrder") || "Guest Order"}
                                </>
                            )}
                        </span>
                    </div>
                );
            }
        },
        {
            field: "contact",
            headerName: t("contact"),
            flex: 2,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex flex-col justify-center h-full text-sm text-gray-900 space-y-1 py-1">
                    <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 text-gray-400 mx-2" />
                        <span className="truncate" title={params.row.email}>
                            {params.row.email || <span className="text-gray-400 italic">{t("noEmail")}</span>}
                        </span>
                    </div>
                    {params.row.phone && params.row.phone.map((phone: string, index: number) => (
                        <div className="flex items-center" key={`${phone}-${index}`}>
                            <Phone className="h-3.5 w-3.5 text-gray-400 mx-2" />
                            {phone}
                        </div>
                    ))}
                    {(!params.row.phone || params.row.phone.length === 0) && (
                        <div className="flex items-center text-gray-400 italic text-xs pl-6">
                            -
                        </div>
                    )}
                </div>
            )
        },
        {
            field: "governorates",
            headerName: t("governorates"),
            flex: 1.5,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex flex-col justify-center h-full text-sm">
                    {(params.row.address?.length ?? 0) > 0 ? (
                        <div className="flex flex-col gap-1">
                            {params.row.address?.map((addr: any, idx: number) => (
                                <div key={idx} className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 mx-2" />
                                    {addr.governorate.name_en}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-400 italic">{t("noAddresses")}</span>
                    )}
                </div>
            )
        },
        {
            field: "total_orders",
            headerName: t("orders") || "Orders",
            flex: 0.8,
            minWidth: 100,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center h-full text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${(params.row.total_orders ?? 0) > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                        {params.row.total_orders ?? 0}
                    </span>
                </div>
            )
        },
        {
            field: "created_at",
            headerName: t("memberSince"),
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center h-full text-sm text-gray-900">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 mx-2" />
                    {new Date(params.row.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            field: "actions",
            headerName: t("actions"),
            flex: 0.8,
            minWidth: 80,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center h-full">
                    <a href={`/admin/customers/${params.row.id}`} className="text-primary-600 hover:text-primary-900 hover:underline transition-all">
                        {t("view")}
                    </a>
                </div>
            )
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{t("customers")}</h2>
                    <p className="text-gray-600">{t("manageCustomerBase")}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    {/* Customer Type Filter */}
                    <select
                        value={filters.customerType}
                        onChange={(e) => setFilters({ ...filters, customerType: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                        <option value="all">{t("allCustomers") || "All Customers"}</option>
                        <option value="withAccount">{t("registeredOnly") || "Registered Only"}</option>
                        <option value="guestOnly">{t("guestOrdersOnly") || "Guest Orders Only"}</option>
                    </select>

                    <div className="flex items-center">
                        <label htmlFor="members" className="align-text-top font-medium text-gray-700 select-none cursor-pointer" onClick={() => setFilters({ ...filters, excludeMembers: !filters.excludeMembers })}>
                            {t("excludeMembers")}
                        </label>
                        <input
                            type="checkbox"
                            name="members"
                            id="members"
                            checked={filters.excludeMembers}
                            className="justify-center h-4 w-4 ml-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            onChange={(e) => {
                                setFilters({ ...filters, excludeMembers: e.target.checked });
                            }}
                        />
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            onChange={handleSearchChange}
                            value={filters.search}
                            name="search"
                            type="text"
                            placeholder={t("searchCustomers")}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={customers || []}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    disableRowSelectionOnClick
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'}
                    sx={{
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f9fafb',
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                        },
                        border: 'none',
                    }}
                />
            </div>
        </motion.div>
    );
}