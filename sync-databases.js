/**
 * Sync Old Supabase → New Supabase
 * =================================
 * Syncs the latest data from the old database to the new one.
 * 
 * Usage:
 *   node sync-databases.js                  → Sync ALL data (full re-sync)
 *   node sync-databases.js --since 2026-04-08  → Sync only data created/updated after this date
 *   node sync-databases.js --table orders      → Sync only a specific table
 *   node sync-databases.js --since 2026-04-08 --table orders  → Combined
 */

const { createClient } = require('@supabase/supabase-js');

// OLD PROJECT
const OLD_SUPABASE_URL = 'https://reqrsmboabgxshacmkst.supabase.co';
const OLD_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcXJzbWJvYWJneHNoYWNta3N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYzMzg1OCwiZXhwIjoyMDcxMjA5ODU4fQ.GVF2Qs6RBX8JxoIah45R_MxSLR2O74hbl8oetWJgBnU';

// NEW PROJECT
const NEW_SUPABASE_URL = 'https://uuqdrhjpbdcjyrdfeone.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cWRyaGpwYmRjanlyZGZlb25lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3NzY0NSwiZXhwIjoyMDkxMjUzNjQ1fQ.3uXTXoevSBPZ89sUBoa4BcOKaYjG2kM7esVzmIXUPb4';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

// Tables in dependency order (parents first)
// conflictCol: the unique column for upsert (default: 'id')
// columnMap: rename columns from old DB → new DB
// transform: function to transform each row before inserting
const TABLES = [
    { schema: 'store', table: 'categories', dateCol: 'created_at' },
    { schema: 'store', table: 'products', dateCol: 'created_at',
        columnMap: { 'name_en': 'name', 'description_en': 'description' }
    },
    { schema: 'store', table: 'product_variants', dateCol: 'created_at' },
    { schema: 'store', table: 'product_categories', dateCol: null },
    { schema: 'store', table: 'product_materials', dateCol: null },
    { schema: 'store', table: 'shipping_governorates', dateCol: null, conflictCol: 'slug' },
    { schema: 'store', table: 'customers', dateCol: 'created_at',
        transform: (row) => { delete row.auth_user_id; return row; }
    },
    { schema: 'store', table: 'customer_addresses', dateCol: 'created_at' },
    { schema: 'store', table: 'promo_codes', dateCol: 'created_at' },
    { schema: 'store', table: 'orders', dateCol: 'created_at' },
    { schema: 'store', table: 'order_items', dateCol: null },
    { schema: 'store', table: 'order_phone_numbers', dateCol: null,
        conflictCol: 'order_id,phone_number',
        transform: (row) => { delete row.id; return row; }
    },
    { schema: 'store', table: 'payment_info', dateCol: null },
    { schema: 'store', table: 'members', dateCol: 'created_at' },
    { schema: 'store', table: 'member_permissions', dateCol: null },
    { schema: 'store', table: 'themes', dateCol: null },
    { schema: 'store', table: 'bazaars', dateCol: 'created_at' },
    { schema: 'store', table: 'ignored_duplicates', dateCol: null, conflictCol: 'group_id' },
];

// Parse CLI arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = { since: null, table: null };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--since' && args[i + 1]) opts.since = args[++i];
        if (args[i] === '--table' && args[i + 1]) opts.table = args[++i];
    }
    return opts;
}

// Fetch all rows from old DB (with optional date filter)
async function fetchFromOld(schema, table, dateCol, since) {
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        let query = oldSupabase
            .schema(schema)
            .from(table)
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        // Apply date filter if sinceDate provided and table has a date column
        if (since && dateCol) {
            query = query.gte(dateCol, since);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            allData = allData.concat(data);
            page++;
            if (data.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    return allData;
}

// Rename columns from old DB format to new DB format
function applyColumnMap(data, columnMap) {
    if (!columnMap) return data;
    return data.map(row => {
        const newRow = { ...row };
        for (const [oldCol, newCol] of Object.entries(columnMap)) {
            if (oldCol in newRow) {
                newRow[newCol] = newRow[oldCol];
                delete newRow[oldCol];
            }
        }
        return newRow;
    });
}

// Apply per-row transform function
function applyTransform(data, transform) {
    if (!transform) return data;
    return data.map(row => transform({ ...row }));
}

// Upsert data into new DB
async function upsertToNew(schema, table, data, conflictCol = 'id') {
    const batchSize = 200;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        const { error } = await newSupabase
            .schema(schema)
            .from(table)
            .upsert(batch, {
                onConflict: conflictCol,
                ignoreDuplicates: false  // Update existing rows
            });

        if (error) {
            // Try one by one for failed batch
            for (const row of batch) {
                const { error: singleError } = await newSupabase
                    .schema(schema)
                    .from(table)
                    .upsert(row, { onConflict: conflictCol, ignoreDuplicates: false });
                if (singleError) {
                    errors++;
                    if (errors <= 5) {
                        console.log(`      ❌ Row ${row.id || row[conflictCol]}: ${singleError.message.substring(0, 100)}`);
                    }
                } else {
                    inserted++;
                }
            }
        } else {
            inserted += batch.length;
        }
    }

    return { inserted, errors };
}

async function main() {
    const opts = parseArgs();

    console.log('========================================');
    console.log('  🔄 مزامنة البيانات: قديم → جديد');
    console.log('========================================\n');

    if (opts.since) {
        console.log(`📅 مزامنة البيانات من: ${opts.since}`);
    } else {
        console.log('📦 مزامنة كاملة (كل البيانات)');
    }
    if (opts.table) {
        console.log(`📋 جدول محدد: ${opts.table}`);
    }
    console.log('');

    const tablesToSync = opts.table
        ? TABLES.filter(t => t.table === opts.table)
        : TABLES;

    if (tablesToSync.length === 0) {
        console.log(`❌ الجدول "${opts.table}" مش موجود في القائمة!`);
        console.log('الجداول المتاحة:', TABLES.map(t => t.table).join(', '));
        return;
    }

    const results = [];

    for (const { schema, table, dateCol, conflictCol, columnMap, transform } of tablesToSync) {
        process.stdout.write(`  🔹 ${table}... `);

        try {
            // 1. Fetch from old
            let data = await fetchFromOld(schema, table, dateCol, opts.since);

            if (data.length === 0) {
                console.log('⏭️  لا توجد بيانات جديدة');
                results.push({ table, fetched: 0, inserted: 0, errors: 0 });
                continue;
            }

            // 2. Apply column renames and transforms
            data = applyColumnMap(data, columnMap);
            data = applyTransform(data, transform);

            process.stdout.write(`(${data.length} rows) → `);

            // 3. Upsert to new
            const { inserted, errors } = await upsertToNew(schema, table, data, conflictCol || 'id');

            if (errors > 0) {
                console.log(`✅ ${inserted} inserted, ❌ ${errors} errors`);
            } else {
                console.log(`✅ ${inserted} rows synced`);
            }

            results.push({ table, fetched: data.length, inserted, errors });

        } catch (err) {
            console.log(`❌ ${err.message.substring(0, 100)}`);
            results.push({ table, fetched: 0, inserted: 0, errors: 1, error: err.message });
        }
    }

    // Summary
    console.log('\n========================================');
    console.log('  📊 ملخص المزامنة');
    console.log('========================================\n');

    const totalFetched = results.reduce((s, r) => s + r.fetched, 0);
    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors, 0);

    for (const r of results) {
        if (r.fetched > 0) {
            const icon = r.errors > 0 ? '⚠️' : '✅';
            console.log(`  ${icon} ${r.table}: ${r.inserted}/${r.fetched}`);
        }
    }

    console.log(`\n  📥 إجمالي: ${totalInserted}/${totalFetched} rows`);
    if (totalErrors > 0) {
        console.log(`  ❌ أخطاء: ${totalErrors}`);
    }
    console.log('\n✨ تمت المزامنة!');
}

main().catch(console.error);
