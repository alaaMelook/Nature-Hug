// app/api/admin/product-materials/from-missing/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/data/supabase/server";

type ReqBody = {
  itemIds: Array<number | string>;
  supplier_id?: number; // optional override -> create single invoice for this supplier
  invoice_no?: string;
  date?: string; // YYYY-MM-DD or ISO
  note?: string;
  extra_expenses?: number;
};

export async function POST(req: Request) {
  const supabase = await supabase();
  try {
    const body: ReqBody = await req.json();

    if (!body.itemIds || !Array.isArray(body.itemIds) || body.itemIds.length === 0) {
      return NextResponse.json({ error: "Missing itemIds array in request body" }, { status: 400 });
    }

    const itemIdsRaw = body.itemIds;

    // separate numeric missing_item ids and auto-<materialId> ids
    const numericIds: number[] = [];
    const autoMaterialIds: number[] = [];

    for (const id of itemIdsRaw) {
      if (typeof id === "number") numericIds.push(id);
      else if (typeof id === "string") {
        if (id.startsWith("auto-")) {
          const mid = Number(id.split("auto-")[1]);
          if (!Number.isNaN(mid)) autoMaterialIds.push(mid);
        } else if (/^\d+$/.test(id)) {
          numericIds.push(Number(id));
        } else {
          // ignore unknown id format
        }
      }
    }

    // fetch missing_items rows (hand-entered)
    let missingRows: any[] = [];
    if (numericIds.length) {
      const { data: missData, error: missErr } = await supabase
        .from("missing_items")
        .select("*")
        .in("id", numericIds);
      if (missErr) throw missErr;
      missingRows = missData || [];
    }

    // collect material ids referenced by missing rows (if any)
    const materialIdsFromMissing = missingRows
      .map((r) => r.material_id)
      .filter((v: any) => v !== null && v !== undefined);

    // unify material ids to fetch (auto + from missing rows)
    const materialIdsSet = new Set<number>([...autoMaterialIds, ...materialIdsFromMissing].filter(Boolean));
    const materialIds = Array.from(materialIdsSet);

    // fetch materials in one go
    let materials: any[] = [];
    if (materialIds.length) {
      const { data: matData, error: matErr } = await supabase
        .from("materials")
        .select("id, name, supplier_id, stock_grams, low_stock_threshold, price_per_gram")
        .in("id", materialIds);
      if (matErr) throw matErr;
      materials = matData || [];
    }

    // Build work entries
    type Entry = {
      source: "missing" | "auto";
      missing_id?: number;
      material_id?: number | null;
      supplier_id?: number | null;
      quantity: number;
      price: number; // line total price
      notes?: string | null;
    };
    const entries: Entry[] = [];

    // Process missing_rows
    for (const m of missingRows) {
      const material = materials.find((x) => x.id === m.material_id) || null;
      const qty = m.quantity != null ? Number(m.quantity) : 1;
      const price = m.price != null ? Number(m.price) : (material ? Number(material.price_per_gram || 0) * qty : 0);
      const supplier_id = body.supplier_id ?? (m.supplier_id ?? (material?.supplier_id ?? null));
      entries.push({
        source: "missing",
        missing_id: m.id,
        material_id: m.material_id ?? null,
        supplier_id: supplier_id ?? null,
        quantity: qty,
        price,
        notes: m.notes ?? null,
      });
    }

    // Process auto material ids (low-stock items)
    for (const mid of autoMaterialIds) {
      const mat = materials.find((x) => x.id === mid);
      if (!mat) continue;
      const low = Number(mat.low_stock_threshold ?? 0);
      const stock = Number(mat.stock_grams ?? 0);
      const qty = (!Number.isNaN(low) && !Number.isNaN(stock) && low > stock) ? Math.max(low - stock, 1) : 1;
      const pricePer = Number(mat.price_per_gram ?? 0);
      const price = pricePer * qty;
      const supplier_id = body.supplier_id ?? (mat.supplier_id ?? null);
      entries.push({
        source: "auto",
        material_id: mid,
        supplier_id: supplier_id ?? null,
        quantity: qty,
        price,
        notes: "Auto low stock",
      });
    }

    if (entries.length === 0) {
      return NextResponse.json({ error: "No valid entries found for given itemIds" }, { status: 400 });
    }

    // If caller provided supplier_id override -> create single invoice for that supplier
    const overrideSupplier = body.supplier_id ?? null;

    // Group entries by supplier (string key)
    const groups = new Map<string, Entry[]>();
    if (overrideSupplier != null) {
      groups.set(String(overrideSupplier), entries);
    } else {
      for (const e of entries) {
        const sid = e.supplier_id ?? null;
        const key = sid === null ? "null" : String(sid);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(e);
      }
    }

    // If any group key is "null" and overrideSupplier not set => cannot create invoice (supplier_id NOT NULL)
    if (!overrideSupplier && groups.has("null")) {
      const missingInfos = groups.get("null")!.map((g) => ({
        missing_id: g.missing_id ?? null,
        material_id: g.material_id ?? null,
        notes: g.notes,
      }));
      return NextResponse.json(
        {
          error:
            "Some items have no supplier_id. Either provide supplier_id in request body (supplier_id) or ensure items/materials have supplier_id.",
          missing: missingInfos,
        },
        { status: 400 }
      );
    }

    // For each supplier group create invoice and items
    const createdInvoices: any[] = [];

    for (const [key, groupEntries] of groups) {
      const supplierIdNum = overrideSupplier != null ? overrideSupplier : Number(key);
      if (Number.isNaN(supplierIdNum)) {
        // Shouldn't happen due to check above, but safe-guard
        continue;
      }

      const itemsTotal = groupEntries.reduce((s, x) => s + (x.price || 0), 0);
      const extra = Number(body.extra_expenses ?? 0);
      const total = itemsTotal + extra;

      const invoice_no =
        body.invoice_no ??
        `MIS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`;

      const dateVal = body.date ?? new Date().toISOString().slice(0, 10);

      // create purchase_invoice
      const { data: invoiceData, error: invoiceErr } = await supabase
        .from("purchase_invoices")
        .insert([
          {
            supplier_id: supplierIdNum,
            invoice_no,
            date: dateVal,
            total,
            attachments: [], // none
            note: body.note ?? null,
            extra_expenses: extra,
          },
        ])
        .select()
        .single();

      if (invoiceErr) {
        console.error("Error inserting purchase_invoice:", invoiceErr);
        return NextResponse.json({ error: invoiceErr.message }, { status: 500 });
      }

      // prepare purchase_invoice_items rows
      const itemsToInsert = groupEntries.map((e) => ({
        purchase_invoice_id: invoiceData.id,
        material_id: e.material_id ?? null,
        quantity: e.quantity,
        price: e.price,
      }));

      const { data: insertedItems, error: itemsErr } = await supabase
        .from("purchase_invoice_items")
        .insert(itemsToInsert)
        .select();

      if (itemsErr) {
        console.error("Error inserting purchase_invoice_items:", itemsErr);
        // Note: partial rollback not implemented
        return NextResponse.json({ error: itemsErr.message }, { status: 500 });
      }

      // update materials stock & price (for items that have material_id)
      for (const e of groupEntries) {
        if (!e.material_id) continue;
        const mat = materials.find((m) => m.id === e.material_id);
        // get current stock & price from DB (fresh)
        const { data: freshMat, error: freshErr } = await supabase
          .from("materials")
          .select("stock_grams, price_per_gram")
          .eq("id", e.material_id)
          .single();

        if (freshErr) {
          console.error("Error fetching material before update:", freshErr);
          continue;
        }

        const oldStock = Number(freshMat?.stock_grams ?? 0);
        const newStock = oldStock + Number(e.quantity ?? 0);
        const oldPrice = Number(freshMat?.price_per_gram ?? 0);
        const newPricePerGram = e.quantity ? Number(e.price ?? 0) / Number(e.quantity) : oldPrice;

        const { error: updErr } = await supabase
          .from("materials")
          .update({ stock_grams: newStock, price_per_gram: newPricePerGram })
          .eq("id", e.material_id);

        if (updErr) {
          console.error("Error updating material stock/price:", updErr);
        }
      }

      // mark missing_items purchased for source === 'missing'
      const missingIdsToMark = groupEntries
        .filter((g) => g.source === "missing" && g.missing_id != null)
        .map((g) => g.missing_id);

      if (missingIdsToMark.length) {
        const { error: markErr } = await supabase
          .from("missing_items")
          .update({ purchased: true, checked: false, updated_at: new Date().toISOString() })
          .in("id", missingIdsToMark);
        if (markErr) console.error("Error marking missing_items purchased:", markErr);
      }

      createdInvoices.push({
        invoice: invoiceData,
        inserted_items_count: insertedItems?.length ?? itemsToInsert.length,
      });
    }

    return NextResponse.json({ success: true, invoices: createdInvoices });
  } catch (err: any) {
    console.error("from-missing error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
