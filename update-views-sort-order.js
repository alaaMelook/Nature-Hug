const ACCESS_TOKEN = 'sbp_f93d87df764b550be06d29881dafd7067ec82f5f';
const PROJECT_REF = 'uuqdrhjpbdcjyrdfeone';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function exec(sql) {
    for (let i = 0; i < 5; i++) {
        const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: sql }),
        });
        if (r.ok) return await r.json();
        if (r.status === 429) { await sleep(4000); continue; }
        const e = await r.text();
        throw new Error(e.substring(0, 500));
    }
}

async function main() {
    console.log('📦 Updating products_view_en with global sort_order handling...');
    await exec(`
        CREATE OR REPLACE VIEW store.products_view_en AS
        SELECT 
            p.id,
            p.id AS product_id,
            v.id AS variant_id,
            COALESCE(v.name_en, p.name, '') AS name,
            COALESCE(v.description_en, p.description) AS description,
            COALESCE(v.price, p.price, 0) AS price,
            COALESCE(v.stock, p.stock, 0) AS stock,
            COALESCE(v.discount, p.discount) AS discount,
            COALESCE(v.image, p.image_url) AS image,
            c.name_en AS category_name,
            p.skin_type,
            COALESCE(v.slug, p.slug) AS slug,
            p.product_type,
            COALESCE(v.created_at, p.created_at) AS created_at,
            COALESCE(rv.avg_rating, 0) AS avg_rating,
            COALESCE(v.sort_order, p.sort_order, 0) AS sort_order
        FROM store.products p
        LEFT JOIN store.product_variants v ON v.product_id = p.id
        LEFT JOIN LATERAL (
            SELECT trunc(avg(r.rating))::integer AS avg_rating
            FROM store.reviews r
            WHERE r.product_id = p.id
        ) rv ON true
        LEFT JOIN store.categories c ON c.id = p.category_id
        WHERE COALESCE(v.is_visible, p.is_visible, false) = true;
    `);
    await sleep(500);

    console.log('📦 Updating products_view_ar with global sort_order handling...');
    await exec(`
        CREATE OR REPLACE VIEW store.products_view_ar AS
        SELECT 
            p.id,
            p.id AS product_id,
            v.id AS variant_id,
            COALESCE(v.name_ar, p.name_ar, '') AS name,
            COALESCE(v.description_ar, p.description_ar) AS description,
            COALESCE(v.price, p.price, 0) AS price,
            COALESCE(v.stock, p.stock, 0) AS stock,
            COALESCE(v.discount, p.discount) AS discount,
            COALESCE(v.image, p.image_url) AS image,
            c.name_en AS category_name,
            p.skin_type,
            COALESCE(v.slug, p.slug) AS slug,
            p.product_type,
            COALESCE(v.created_at, p.created_at) AS created_at,
            COALESCE(rv.avg_rating::numeric, 0.0) AS avg_rating,
            COALESCE(v.sort_order, p.sort_order, 0) AS sort_order
        FROM store.products p
        LEFT JOIN store.product_variants v ON v.product_id = p.id
        LEFT JOIN LATERAL (
            SELECT trunc(avg(r.rating))::integer AS avg_rating
            FROM store.reviews r
            WHERE r.product_id = p.id
        ) rv ON true
        LEFT JOIN store.categories c ON c.id = p.category_id
        WHERE COALESCE(v.is_visible, p.is_visible, false) = true;
    `);
    console.log('✅ Views updated');
}

main().catch(console.error);
