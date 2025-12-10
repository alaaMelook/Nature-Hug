"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Image from "next/image";

interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string | null;
}

interface Material {
  id: number;
  name: string;
  price_per_gram: number;
  stock_grams: number;
}

interface InvoiceItem {
  material_id: number;
  quantity: number;
  price: number; // إجمالي السعر
}

interface Invoice {
  id?: number;
  invoice_no: string;
  supplier_id: number;
  date: string;
  total: number;
  attachments?: string[];
  note?: string | null;
  purchase_invoice_items?: InvoiceItem[];
  extra_expenses?: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<"supplier" | "invoice">("supplier");
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);

  const [newSupplier, setNewSupplier] = useState<Supplier>({
    id: 0,
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [newInvoice, setNewInvoice] = useState<Invoice>({
    invoice_no: "",
    supplier_id: 0,
    date: "",
    total: 0,
    attachments: [],
    note: "",
    extra_expenses: 0,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // 🟩 Load all data safely (with mounted check)
  useEffect(() => {
    let mounted = true;

    const fetchAllSafe = async () => {
      try {
        const [supRes, matRes, invRes] = await Promise.all([
          fetch("/api/admin/suppliers"),
          fetch("/api/admin/materials"),
          fetch("/api/admin/purchase_invoices"),
        ]);

        const [sData, mData, iData] = await Promise.all([
          supRes.json(),
          matRes.json(),
          invRes.json(),
        ]);

        if (!mounted) return;
        setSuppliers(sData || []);
        setMaterials(mData || []);
        const uniqueInvoices = Array.isArray(iData)
          ? iData.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
          : [];
        setInvoices(uniqueInvoices);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllSafe();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [supRes, matRes, invRes] = await Promise.all([
        fetch("/api/admin/suppliers"),
        fetch("/api/admin/materials"),
        fetch("/api/admin/purchase_invoices"),
      ]);
      const [sData, mData, iData] = await Promise.all([
        supRes.json(),
        matRes.json(),
        invRes.json(),
      ]);
      setSuppliers(sData || []);
      setMaterials(mData || []);
      const uniqueInvoices = Array.isArray(iData)
        ? iData.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
        : [];
      setInvoices(uniqueInvoices);
    } catch (err) {
      console.error(err);
    }
  };

  // 🟦 SUPPLIERS CRUD
  const handleAddSupplier = async () => {
    const url = editingSupplierId
      ? `/api/admin/suppliers/${editingSupplierId}`
      : "/api/admin/suppliers";
    const method = editingSupplierId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSupplier),
    });

    setNewSupplier({
      id: 0,
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
    setEditingSupplierId(null);
    setShowModal(false);
    await fetchAll();
  };

  const handleEditSupplier = (s: Supplier) => {
    setFormType("supplier");
    setNewSupplier(s);
    setEditingSupplierId(s.id);
    setShowModal(true);
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm("Delete supplier?")) return;
    await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  // 🟨 INVOICES CRUD
  const addNewItem = () =>
    setInvoiceItems((s) => [...s, { material_id: 0, quantity: 0, price: 0 }]);

  const updateItem = (i: number, payload: Partial<InvoiceItem>) => {
    setInvoiceItems((cur) =>
      cur.map((it, idx) => (idx === i ? { ...it, ...payload } : it))
    );
  };

  const calcTotal = () => {
    const itemsTotal = invoiceItems.reduce((sum, it) => sum + it.price, 0);
    return itemsTotal + Number(newInvoice.extra_expenses || 0);
  };

  const handleAddInvoice = async () => {
    if (!newInvoice.supplier_id || !newInvoice.invoice_no)
      return alert("Supplier & Invoice No required");

    const payload = {
      supplier_id: newInvoice.supplier_id,
      invoice_no: newInvoice.invoice_no,
      date: newInvoice.date || new Date().toISOString().slice(0, 10),
      total: calcTotal(),
      attachments: newInvoice.attachments || [],
      note: newInvoice.note || "",
      extra_expenses: newInvoice.extra_expenses || 0,
      items: invoiceItems.filter(it => it.material_id && it.material_id !== 0),
    };


    const method = editingInvoiceId ? "PUT" : "POST";
    const url = editingInvoiceId
      ? `/api/admin/purchase_invoices/${editingInvoiceId}`
      : "/api/admin/purchase_invoices";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.error) alert(result.error);
    else {
      alert("✅ Invoice saved!");
      await fetchAll();
      setNewInvoice({
        invoice_no: "",
        supplier_id: 0,
        date: "",
        total: 0,
        attachments: [],
        note: "",
        extra_expenses: 0,
      });
      setInvoiceItems([]);
      setEditingInvoiceId(null);
      setShowModal(false);
    }
  };

  const handleEditInvoice = (inv: Invoice) => {
    setFormType("invoice");
    setEditingInvoiceId(inv.id || null);
    setNewInvoice({
      ...inv,
      attachments: inv.attachments || [],
      extra_expenses: inv.extra_expenses || 0,
    });
    setInvoiceItems(inv.purchase_invoice_items || []);
    setShowModal(true);
  };

  const handleDeleteInvoice = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete invoice?")) return;
    await fetch(`/api/admin/purchase_invoices/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  // 🟧 Upload files
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files) return;
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (result.url) uploadedUrls.push(result.url);
    }
    setNewInvoice((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...uploadedUrls],
    }));
  };

  // 🧾 TABLES
  const supplierCols: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "notes", headerName: "Notes", flex: 1 },
    {
      field: "actions",
      headerName: "⚙️ Actions",
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-3">
          <button onClick={() => handleEditSupplier(params.row)}>✏️</button>
          <button onClick={() => handleDeleteSupplier(params.row.id)}>🗑️</button>
        </div>
      ),
    },
  ];

  const invoiceCols: GridColDef[] = [
    { field: "invoice_no", headerName: "Invoice No", flex: 1 },
    {
      field: "supplier_name",
      headerName: "Supplier",
      flex: 1,
      renderCell: (params) => {
        const sup = suppliers.find((s) => s.id === params.row.supplier_id);
        return <span>{sup ? sup.name : "-"}</span>;
      },
    },
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "extra_expenses",
      headerName: "Extra Expenses",
      flex: 1,
      renderCell: (params) => `${params.row.extra_expenses || 0} EGP`,
    },
    { field: "total", headerName: "Total (EGP)", flex: 1 },
    { field: "note", headerName: "Note", flex: 1 },
    {
      field: "attachments",
      headerName: "📎 Attachments",
      flex: 1.5,
      renderCell: (params) =>
        (params.row.attachments || []).length ? (
          <div className="flex flex-wrap gap-1">
            {params.row.attachments.map((url: string, i: number) => (
              <a
                key={i}
                href={url}
                target="_blank"
                className="underline text-blue-600 text-xs"
              >
                img{i + 1}
              </a>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      field: "actions",
      headerName: "⚙️",
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-3">
          <button onClick={() => handleEditInvoice(params.row)}>✏️</button>
          <button onClick={() => handleDeleteInvoice(params.row.id)}>🗑️</button>
        </div>
      ),
    },
  ];

  const totalSum = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📦 Suppliers & Purchase Invoices</h1>

      <div className="flex gap-3">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setFormType("supplier");
            setShowModal(true);
          }}
        >
          + Add Supplier
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setFormType("invoice");
            setShowModal(true);
          }}
        >
          + Add Invoice
        </button>
      </div>

      {/* Suppliers */}
      <div>
        <h2 className="text-xl font-bold mb-2">Suppliers</h2>
        <DataGrid rows={suppliers} columns={supplierCols} autoHeight />
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-xl font-bold mb-2">Purchase Invoices</h2>
        <DataGrid
          rows={invoices.map((inv) => ({ ...inv, id: inv.id }))}
          columns={invoiceCols}
          autoHeight
          getRowId={(row) => row.id!}
        />
        <div className="text-right font-bold mt-4">
          🧾 Total for all invoices: {totalSum.toFixed(2)} EGP
        </div>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-lg w-[720px] max-h-[90vh] overflow-y-auto">
            {formType === "supplier" ? (
              <>
                <h2 className="text-lg font-bold mb-4">
                  {editingSupplierId ? "Edit Supplier" : "Add Supplier"}
                </h2>
                <input
                  className="border p-2 w-full mb-2"
                  placeholder="Name"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full mb-2"
                  placeholder="Phone"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full mb-2"
                  placeholder="Email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                />
                <textarea
                  className="border p-2 w-full mb-2"
                  placeholder="Notes"
                  value={newSupplier.notes || ""}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, notes: e.target.value })
                  }
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                  onClick={handleAddSupplier}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4">
                  {editingInvoiceId ? "Edit Invoice" : "Add Invoice"}
                </h2>
                <select
                  className="border p-2 w-full mb-2"
                  value={newInvoice.supplier_id}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      supplier_id: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  className="border p-2 w-full mb-2"
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
                  className="border p-2 w-full mb-2"
                  value={newInvoice.date}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, date: e.target.value })
                  }
                />
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleUploadFiles(e.target.files)}
                  className="border p-2 w-full mb-2"
                />
                <input
                  className="border p-2 w-full mb-2"
                  placeholder="Add image URL manually"
                  onBlur={(e) => {
                    if (e.target.value)
                      setNewInvoice((prev) => ({
                        ...prev,
                        attachments: [
                          ...(prev.attachments || []),
                          e.target.value,
                        ],
                      }));
                  }}
                />
                {newInvoice.attachments?.length ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newInvoice.attachments.map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        className="border object-cover"
                        alt=""
                        width={80}
                        height={80}
                      />
                    ))}
                  </div>
                ) : null}
                <textarea
                  className="border p-2 w-full mb-2"
                  placeholder="Notes (optional)"
                  value={newInvoice.note || ""}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, note: e.target.value })
                  }
                />

                {/* 🟩 Extra Expenses Input */}
                <input
                  type="number"
                  className="border p-2 w-full mb-2"
                  placeholder="Extra Expenses (EGP)"
                  value={newInvoice.extra_expenses || 0}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      extra_expenses: Number(e.target.value),
                    })
                  }
                />

                <div>
                  <h3 className="font-semibold mb-2">Invoice Items</h3>
                  {invoiceItems.map((it, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select
                        className="border p-2 flex-1"
                        value={it.material_id}
                        onChange={(e) =>
                          updateItem(i, {
                            material_id: Number(e.target.value),
                          })
                        }
                      >
                        <option value={0}>Select Material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="border p-2 w-24"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem(i, { quantity: Number(e.target.value) })
                        }
                      />
                      <input
                        type="number"
                        className="border p-2 w-32"
                        placeholder="Total Price"
                        value={it.price}
                        onChange={(e) =>
                          updateItem(i, { price: Number(e.target.value) })
                        }
                      />
                      <button
                        className="text-red-600"
                        onClick={() =>
                          setInvoiceItems((cur) =>
                            cur.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                  <button
                    className="bg-gray-200 px-3 py-1 rounded"
                    onClick={addNewItem}
                  >
                    + Add Item
                  </button>
                </div>
                <div className="mt-4 font-bold text-right">
                  Total: {calcTotal().toFixed(2)} EGP
                </div>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded w-full mt-3"
                  onClick={handleAddInvoice}
                >
                  Save Invoice
                </button>
              </>
            )}
            <button
              className="underline mt-4 text-gray-600 w-full"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
