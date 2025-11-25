"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/data/datasources/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase.schema('store')
            .from('reviews')
            .select('*, products(name_en, name_ar), customers(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Failed to fetch reviews");
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusChange = async (id: number, status: string) => {
        const { error } = await supabase.schema('store')
            .from('reviews')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error(error);
            toast.error("Failed to update status");
        } else {
            toast.success("Status updated");
            fetchReviews();
        }
    };

    if (loading) return <div className="p-6">Loading reviews...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Reviews Moderation</h1>
            <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                        <tr key={review.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{review.products?.name_en}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{review.customers?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{review.rating} / 5</td>
                            <td className="px-6 py-4">{review.comment}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        review.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {review.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => handleStatusChange(review.id, 'approved')} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                <button onClick={() => handleStatusChange(review.id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
