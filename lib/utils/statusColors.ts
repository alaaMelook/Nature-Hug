export const statusColor = (status?: string) => {
    const s = String(status ?? '').toLowerCase();
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('paid') || s.includes('complete') || s.includes('completed') || s.includes('delivered')) return 'bg-green-100 text-green-800';
    if (s.includes('returned') || s.includes('rts')) return 'bg-purple-100 text-purple-800';
    if (s.includes('cancel') || s.includes('failed') || s.includes('refused') || s.includes('declined')) return 'bg-red-100 text-red-800';
    if (s.includes('shipped') || s.includes('out for delivery') || s.includes('processing')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
}