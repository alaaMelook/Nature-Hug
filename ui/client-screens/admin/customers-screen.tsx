'use client';

import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { Search, Mail, Phone, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export function CustomersScreen({ allCustomers }: { allCustomers: ProfileView[] | undefined }) {
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
    }, [filters.excludeMembers]);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            setFilters({ ...filters, search: "" });
            setCustomers(allCustomers);
            return;
        }
        setFilters({ ...filters, search: e.target.value });
        setCustomers(filteredCustomers)
    }
    const filteredCustomers = customers?.filter((customer: ProfileView) => {

        if (customer.name && customer.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return true;
        }
        if (customer.email && customer.email.toLowerCase().includes(filters.search.toLowerCase())) {
            return true;
        }
        if (customer.phone.length > 0) {
            for (let phone of customer.phone) {
                if (phone.toLowerCase().includes(filters.search.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    });
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
                    <p className="text-gray-600">Manage your customer base</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <label htmlFor="members" className="align-text-top font-medium text-gray-700"> Exclude Members </label>
                        <input type="checkbox" name="members" checked={filters.excludeMembers} className="justify-center h-4 w-4 ml-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500 "
                            onChange={(e) => {
                                setFilters({ ...filters, excludeMembers: e.target.checked });
                            }} />

                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            onChange={handleSearchChange}
                            value={filters.search.length > 0 ? filters.search : ""}
                            name="search"
                            type="text"
                            placeholder="Search customers..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Governorates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Member Since
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers?.map((customer: ProfileView) => (
                                <tr key={customer.id} className={`${customer.role ? "bg-primary-50" : "hover:bg-gray-50 "}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-600">
                                                        {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.name || "Unknown"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {customer.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                {customer.email || "No email"}
                                            </div>
                                            {customer.phone.map((phone: string, index: number) => (
                                                <div className="flex items-center mt-1" key={`${phone}-${index}`}>
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" key={`${phone}-${index}`} />
                                                    {phone}
                                                </div>
                                            ))}
                                            {customer.phone.length === 0 && (
                                                <div className="flex items-center mt-1 line-through text-gray-400">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(customer.address?.length ?? 0) > 0 ? customer.address?.map((addr) => addr.governorate.name_en).join(", ") : "No addresses"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-primary-600 hover:text-primary-900 mr-4">
                                            View
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {!customers || customers?.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500">
                        <div className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Couldn't find any customers.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}