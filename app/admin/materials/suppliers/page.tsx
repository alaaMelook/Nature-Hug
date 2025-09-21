"use client";

import { useEffect, useState } from "react";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string | null;
  invoices: Invoice[];
}

interface Invoice {
  id: number;
  invoice_no: string;
  supplier_id: number;
  date: string;
  total: number;
  attachment: string | null;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<"supplier" | "invoice">("supplier");

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [newInvoice, setNewInvoice] = useState({
    supplier_id: "",
    invoice_no: "",
    date: "",
    total: "",
    attachment: "",
  });

  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    const res = await fetch("/api/admin/suppliers");
    const data = await res.json();
    setSuppliers(data);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Add supplier
  const handleAddSupplier = async () => {
    if (editingSupplierId) {
      // Update supplier
      await fetch(`/api/admin/suppliers/${editingSupplierId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
    } else {
      // Add supplier
      await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
    }
    setNewSupplier({ name: "", phone: "", email: "", address: "", notes: "" });
    setEditingSupplierId(null);
    setShowModal(false);
    fetchSuppliers();
  };

  // Edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setFormType("supplier");
    setNewSupplier({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setEditingSupplierId(supplier.id);
    setShowModal(true);
  };

  // Delete supplier
  const handleDeleteSupplier = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
      fetchSuppliers();
    }
  };

  // Add or update invoice
  const handleAddInvoice = async () => {
    if (editingInvoiceId) {
      // Update invoice
      await fetch(`/api/admin/invoices/${editingInvoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
    } else {
      // Add invoice
      await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
    }
    setNewInvoice({
      supplier_id: "",
      invoice_no: "",
      date: "",
      total: "",
      attachment: "",
    });
    setEditingInvoiceId(null);
    setShowModal(false);
    fetchSuppliers();
  };

  // Edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    setFormType("invoice");
    setNewInvoice({
      supplier_id: invoice.supplier_id.toString(),
      invoice_no: invoice.invoice_no || "",
      date: invoice.date || "",
      total: invoice.total.toString() || "",
      attachment: invoice.attachment || "",
    });
    setEditingInvoiceId(invoice.id);
    setShowModal(true);
  };

  // Delete invoice
  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
      fetchSuppliers();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Suppliers Management</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setFormType("supplier");
            setEditingSupplierId(null);
            setEditingInvoiceId(null);
            setNewSupplier({ name: "", phone: "", email: "", address: "", notes: "" });
            setNewInvoice({ supplier_id: "", invoice_no: "", date: "", total: "", attachment: "" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add
        </button>
      </div>

      {/* Suppliers Table */}
      <h2 className="text-xl font-bold mb-4">Suppliers</h2>
      <table className="min-w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Address</th>
            <th className="border px-2 py-1">Notes</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td className="border px-2 py-1">{s.name}</td>
              <td className="border px-2 py-1">{s.phone}</td>
              <td className="border px-2 py-1">{s.email}</td>
              <td className="border px-2 py-1">{s.address}</td>
              <td className="border px-2 py-1">{s.notes}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => handleEditSupplier(s)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => handleDeleteSupplier(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invoices Table */}
      <h2 className="text-xl font-bold mb-4">Purchase Invoices</h2>
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Invoice No</th>
            <th className="border px-2 py-1">Supplier</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Attachment</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.flatMap((s) =>
            s.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="border px-2 py-1">{inv.invoice_no}</td>
                <td className="border px-2 py-1">{s.name}</td>
                <td className="border px-2 py-1">{inv.date}</td>
                <td className="border px-2 py-1">{inv.total}</td>
                <td className="border px-2 py-1">
                  {inv.attachment ? (
                    <a
                      href={inv.attachment}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => handleEditInvoice(inv)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 underline"
                    onClick={() => handleDeleteInvoice(inv.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {editingSupplierId
                ? "Edit Supplier"
                : editingInvoiceId
                ? "Edit Invoice"
                : `Add ${formType === "supplier" ? "Supplier" : "Invoice"}`}
            </h2>

            {/* Switch Form Type */}
            <div className="mb-4">
              <button
                className={`px-3 py-1 mr-2 rounded ${
                  formType === "supplier"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => {
                  setFormType("supplier");
                  setEditingInvoiceId(null);
                  setEditingSupplierId(null);
                  setNewSupplier({ name: "", phone: "", email: "", address: "", notes: "" });
                }}
              >
                Supplier
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  formType === "invoice"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => {
                  setFormType("invoice");
                  setEditingInvoiceId(null);
                  setEditingSupplierId(null);
                  setNewInvoice({ supplier_id: "", invoice_no: "", date: "", total: "", attachment: "" });
                }}
              >
                Invoice
              </button>
            </div>

            {/* Supplier Form */}
            {formType === "supplier" && (
              <div className="space-y-2">
                <input
                  className="border p-2 w-full"
                  placeholder="Name"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full"
                  placeholder="Phone"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full"
                  placeholder="Email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full"
                  placeholder="Address"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                />
                <textarea
                  className="border p-2 w-full"
                  placeholder="Notes"
                  value={newSupplier.notes}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, notes: e.target.value })
                  }
                />
                <button
                  onClick={handleAddSupplier}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                  {editingSupplierId ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            )}

            {/* Invoice Form */}
            {formType === "invoice" && (
              <div className="space-y-2">
                <select
                  className="border p-2 w-full"
                  value={newInvoice.supplier_id}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, supplier_id: e.target.value })
                  }
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  className="border p-2 w-full"
                  placeholder="Invoice No"
                  value={newInvoice.invoice_no}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      invoice_no: e.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  className="border p-2 w-full"
                  value={newInvoice.date}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, date: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full"
                  placeholder="Total"
                  value={newInvoice.total}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, total: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full"
                  placeholder="Attachment URL"
                  value={newInvoice.attachment}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      attachment: e.target.value,
                    })
                  }
                />
                <button
                  onClick={handleAddInvoice}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                  {editingInvoiceId ? "Update Invoice" : "Save Invoice"}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setEditingSupplierId(null);
                setEditingInvoiceId(null);
              }}
              className="mt-4 text-red-600 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}