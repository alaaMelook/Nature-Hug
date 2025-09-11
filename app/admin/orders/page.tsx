"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ----------------------- Types ----------------------- */
type OrderRow = {
  id: number;
  created_at: string;
  status: string;
  total: number;
  customer_id: number | null;
  note?: string | null;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  total: number;
  customer_id: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_governorate: string | null;
  note?: string | null;
};

type Customer = {
  id: number;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  governorate?: string | null;
};

/* ----------------------- Helpers ----------------------- */
function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ----------------------- Order Details Modal ----------------------- */
function OrderDetailsModal({
  order,
  customer,
  onClose,
}: {
  order: Order | null;
  customer: Customer | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded max-w-3xl w-full shadow-lg overflow-auto max-h-[90vh] p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-2">Order #{order.id}</h2>
        <div className="mb-4">
          <p>
            <strong>Status:</strong> {order.status ?? "-"}
          </p>
          <p>
            <strong>Total:</strong> ${order.total ?? "0.00"}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {order ? new Date(order.created_at).toLocaleString() : "-"}
          </p>
          <p>
            <strong>Note:</strong> {order.note ?? "-"}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Customer</h3>
          {customer ? (
            <div>
              <p>{customer.name ?? "-"}</p>
              <p className="text-sm text-gray-600">{customer.phone ?? "-"}</p>
              <p className="text-sm text-gray-600">{customer.email ?? "-"}</p>
              <p className="text-sm text-gray-600">
                Address: {customer.address ?? "-"}
              </p>
              <p className="text-sm text-gray-600">
                Governorate: {customer.governorate ?? "-"}
              </p>
            </div>
          ) : (
            <p>-</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Main Page ----------------------- */
export default function AllOrdersPage() {
  /* state */
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const limit = 10;

  /* Fetch function */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // search customers first
      let matchingCustomerIds: number[] | null = null;
      if (search.trim()) {
        const { data: customersData, error: custErr } = await supabase
          .from("customers")
          .select("id")
          .or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        if (custErr) {
          console.warn("customer search error:", custErr);
          matchingCustomerIds = [];
        } else {
          matchingCustomerIds = (customersData ?? []).map((c: any) => c.id);
          if (matchingCustomerIds.length === 0) {
            setOrders([]);
            setTotalOrders(0);
            setTotalSales(0);
            setLoading(false);
            return;
          }
        }
      }

      // main query
      let q: any = supabase
        .from("orders")
        .select("id, created_at, status, total, customer_id, note", {
          count: "exact",
        });

      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (matchingCustomerIds)
        q = q.in(
          "customer_id",
          matchingCustomerIds.length ? matchingCustomerIds : [0]
        );

      if (sort === "newest") q = q.order("created_at", { ascending: false });
      else if (sort === "oldest") q = q.order("created_at", { ascending: true });
      else if (sort === "total_desc")
        q = q.order("total", { ascending: false });
      else if (sort === "total_asc") q = q.order("total", { ascending: true });

      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setTotalOrders(0);
        setTotalSales(0);
        setLoading(false);
        return;
      }

      const rows: OrderRow[] = (data ?? []) as OrderRow[];

      // fetch customers + addresses
      const custIds = Array.from(
        new Set(rows.map((r) => r.customer_id).filter(Boolean))
      ) as number[];
      let customersMap: Record<number, Customer> = {};
      if (custIds.length) {
        const { data: customersData } = await supabase
          .from("customers")
          .select("id, name, phone, email, customer_addresses(address, governorate)")
          .in("id", custIds);

        (customersData ?? []).forEach((c: any) => {
          customersMap[c.id] = {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.customer_addresses?.[0]?.address ?? null,
            governorate: c.customer_addresses?.[0]?.governorate ?? null,
          };
        });
      }

      const mapped: Order[] = rows.map((r) => ({
        id: r.id,
        created_at: r.created_at,
        status: r.status,
        total: Number(r.total ?? 0),
        customer_id: r.customer_id,
        customer_name: r.customer_id
          ? customersMap[r.customer_id]?.name ?? null
          : null,
        customer_phone: r.customer_id
          ? customersMap[r.customer_id]?.phone ?? null
          : null,
        customer_address: r.customer_id
          ? customersMap[r.customer_id]?.address ?? null
          : null,
        customer_governorate: r.customer_id
          ? customersMap[r.customer_id]?.governorate ?? null
          : null,
        note: r.note ?? null,
      }));

      setOrders(mapped);
      setTotalOrders(count ?? 0);

      let sumQuery: any = supabase.from("orders").select("total");
      if (statusFilter !== "all") sumQuery = sumQuery.eq("status", statusFilter);
      if (matchingCustomerIds)
        sumQuery = sumQuery.in(
          "customer_id",
          matchingCustomerIds.length ? matchingCustomerIds : [0]
        );
      const { data: totalsData } = await sumQuery;
      const sum = (totalsData ?? []).reduce(
        (acc: number, r: any) => acc + Number(r.total ?? 0),
        0
      );
      setTotalSales(sum);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setTotalOrders(0);
      setTotalSales(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter, sort]);

  /* Export CSV */
  const handleExport = () => {
    const headers = [
      "ID",
      "Customer",
      "Phone",
      "Address",
      "Governorate",
      "Note",
      "Status",
      "Total",
      "Created At",
    ];
    const rows = orders.map((o) => [
      o.id,
      o.customer_name ?? "-",
      o.customer_phone ?? "-",
      o.customer_address ?? "-",
      o.customer_governorate ?? "-",
      o.note ?? "-",
      o.status,
      o.total,
      new Date(o.created_at).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(",")
      )
      .join("\n");
    downloadCsv("orders.csv", csvContent);
  };

  const toggleSelectOrder = (id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllOnPage = () => {
    if (selectedOrders.length === orders.length) setSelectedOrders([]);
    else setSelectedOrders(orders.map((o) => o.id));
  };

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((totalOrders || 0) / limit)),
    [totalOrders]
  );

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>

      {/* Summary */}
      <div className="flex gap-6 mb-6">
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-xl font-bold">{totalOrders}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-600">Total Sales</p>
          <p className="text-xl font-bold">${Number(totalSales).toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="total_desc">Total (High → Low)</option>
          <option value="total_asc">Total (Low → High)</option>
        </select>

        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b">
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={selectAllOnPage}
              />
            </th>
            <th className="px-4 py-2 text-left border-b">ID</th>
            <th className="px-4 py-2 text-left border-b">Customer</th>
            <th className="px-4 py-2 text-left border-b">Phone</th>
            <th className="px-4 py-2 text-left border-b">Address</th>
            <th className="px-4 py-2 text-left border-b">Governorate</th>
            <th className="px-4 py-2 text-left border-b">Note</th>
            <th className="px-4 py-2 text-left border-b">Status</th>
            <th className="px-4 py-2 text-left border-b">Total</th>
            <th className="px-4 py-2 text-left border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelectOrder(order.id)}
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setSelectedOrder(order);
                      setSelectedCustomer({
                        id: order.customer_id ?? 0,
                        name: order.customer_name,
                        phone: order.customer_phone,
                        address: order.customer_address,
                        governorate: order.customer_governorate,
                      });
                    }}
                  >
                    #{order.id}
                  </button>
                </td>
                <td className="px-4 py-2 border-b">
                  {order.customer_name ?? "—"}
                </td>
                <td className="px-4 py-2 border-b">
                  {order.customer_phone ?? "—"}
                </td>
                <td className="px-4 py-2 border-b">
                  {order.customer_address ?? "—"}
                </td>
                <td className="px-4 py-2 border-b">
                  {order.customer_governorate ?? "—"}
                </td>
                <td className="px-4 py-2 border-b">{order.note ?? "—"}</td>
                <td className="px-4 py-2 border-b">{order.status}</td>
                <td className="px-4 py-2 border-b">
                  ${Number(order.total).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(order.created_at).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-6 text-center text-gray-500"
              >
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {pageCount}
        </span>
        <button
          disabled={page >= pageCount}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          customer={selectedCustomer}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
