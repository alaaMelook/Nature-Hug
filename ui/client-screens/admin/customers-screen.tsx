'use client';

import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { Search, Mail, Phone, Calendar, User, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export function CustomersScreen({ allCustomers }: { allCustomers: ProfileView[] | undefined }) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        search: "",
        excludeMembers: true,
    });
    const [customers, setCustomers] = useState(allCustomers);

    useEffect(() => {
        if (filters.excludeMembers) {
            setCustomers(allCustomers?.filter((customer) => customer.role === null));
        } else {
            setCustomers(allCustomers);
        }
    }, [filters.excludeMembers, allCustomers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setFilters({ ...filters, search: searchValue });

        if (searchValue === "") {
            setCustomers(filters.excludeMembers ? allCustomers?.filter(c => c.role === null) : allCustomers);
            return;
        }

        const baseCustomers = filters.excludeMembers ? allCustomers?.filter(c => c.role === null) : allCustomers;

        const filtered = baseCustomers?.filter((customer: ProfileView) => {
            if (customer.name && customer.name.toLowerCase().includes(searchValue.toLowerCase())) return true;
            if (customer.email && customer.email.toLowerCase().includes(searchValue.toLowerCase())) return true;
            if (customer.phone.some(p => p.toLowerCase().includes(searchValue.toLowerCase()))) return true;
            return false;
        });
        setCustomers(filtered);
    }

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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t("customer")}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t("contact")}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t("governorates")}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t("memberSince")}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t("status")}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                                {customers?.map((customer: ProfileView, index) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${customer.role ? "bg-primary-50/50" : "hover:bg-gray-50/50"} transition-colors`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                                        {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {customer.name || "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {String(customer.id).substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 space-y-1">
                                                <div className="flex items-center">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400 mr-2" />
                                                    {customer.email || <span className="text-gray-400 italic">{t("noEmail")}</span>}
                                                </div>
                                                {customer.phone.map((phone: string, index: number) => (
                                                    <div className="flex items-center" key={`${phone}-${index}`}>
                                                        <Phone className="h-3.5 w-3.5 text-gray-400 mr-2" />
                                                        {phone}
                                                    </div>
                                                ))}
                                                {customer.phone.length === 0 && (
                                                    <div className="flex items-center text-gray-400 italic text-xs pl-6">
                                                        -
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(customer.address?.length ?? 0) > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {customer.address?.map((addr, idx) => (
                                                        <div key={idx} className="flex items-center">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400 mr-2" />
                                                            {addr.governorate.name_en}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">{t("noAddresses")}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400 mr-2" />
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${customer.role ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>
                                                {customer.role ? customer.role : t("active")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <a href={`/admin/customers/${customer.id}`} className="text-primary-600 hover:text-primary-900 hover:underline transition-all">
                                                {t("view")}
                                            </a>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {(!customers || customers.length === 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed"
                >
                    <div className="text-gray-500 flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900">{t("noCustomers")}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {t("couldntFindCustomers")}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}