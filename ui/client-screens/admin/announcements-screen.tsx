"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Megaphone,
    Send,
    Trash2,
    Users,
    User,
    CheckCircle2,
    Circle,
    Plus,
    X,
    AlertCircle,
    Clock,
    Pencil,
    SmilePlus,
} from "lucide-react";

interface Announcement {
    id: number;
    title: string;
    message: string;
    target: "all" | "specific";
    target_member_id: number | null;
    created_by: number;
    read_by: number[];
    reactions: Record<string, number[]>;
    created_at: string;
}

interface StaffMember {
    id: number;
    user_id: number;
    role: string;
    customers: {
        id: number;
        name: string;
        email: string;
    };
}

const REACTION_EMOJIS = ["👍", "❤️", "🎉", "👏", "🔥", "💯"];

export function AnnouncementsScreen({
    isAdmin,
    memberRole,
}: {
    isAdmin: boolean;
    memberRole: string;
}) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [currentMemberId, setCurrentMemberId] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState<"all" | "specific">("all");
    const [targetMemberId, setTargetMemberId] = useState<number | null>(null);

    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [editSaving, setEditSaving] = useState(false);

    // Expanded and reaction picker
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [reactionPickerId, setReactionPickerId] = useState<number | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/announcements");
            const data = await res.json();
            if (data.success) {
                setAnnouncements(data.data);
                setStaffList(data.staffList || []);
                setCurrentMemberId(data.currentMemberId || 0);
            }
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Mark as read when staff expands
    const handleExpand = async (announcement: Announcement) => {
        const isExpanded = expandedId === announcement.id;
        setExpandedId(isExpanded ? null : announcement.id);
        setReactionPickerId(null);

        if (
            !isExpanded &&
            !isAdmin &&
            currentMemberId &&
            !announcement.read_by?.includes(currentMemberId)
        ) {
            try {
                await fetch("/api/admin/announcements/read", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ announcement_id: announcement.id }),
                });
                setAnnouncements((prev) =>
                    prev.map((a) =>
                        a.id === announcement.id
                            ? { ...a, read_by: [...(a.read_by || []), currentMemberId] }
                            : a
                    )
                );
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }
    };

    // Reaction toggle
    const handleReaction = async (announcementId: number, emoji: string) => {
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "reaction",
                    announcement_id: announcementId,
                    emoji,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAnnouncements((prev) =>
                    prev.map((a) =>
                        a.id === announcementId
                            ? { ...a, reactions: data.reactions }
                            : a
                    )
                );
            }
        } catch (err) {
            console.error("Failed to toggle reaction:", err);
        }
        setReactionPickerId(null);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!title.trim() || !message.trim()) {
            setError("Title and message are required");
            return;
        }
        if (target === "specific" && !targetMemberId) {
            setError("Please select a staff member");
            return;
        }

        setSending(true);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    message: message.trim(),
                    target,
                    target_member_id: target === "specific" ? targetMemberId : null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess("Announcement sent successfully! ✅");
                setTitle("");
                setMessage("");
                setTarget("all");
                setTargetMemberId(null);
                setShowForm(false);
                fetchAnnouncements();
            } else {
                setError(data.error || "Failed to send announcement");
            }
        } catch (err) {
            setError("Failed to send announcement");
        } finally {
            setSending(false);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setEditTitle(announcement.title);
        setEditMessage(announcement.message);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        setEditSaving(true);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingId,
                    title: editTitle.trim(),
                    message: editMessage.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAnnouncements((prev) =>
                    prev.map((a) =>
                        a.id === editingId
                            ? { ...a, title: editTitle.trim(), message: editMessage.trim() }
                            : a
                    )
                );
                setEditingId(null);
                setSuccess("Announcement updated ✅");
            } else {
                setError(data.error || "Failed to update");
            }
        } catch (err) {
            setError("Failed to update announcement");
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setAnnouncements((prev) => prev.filter((a) => a.id !== id));
                setSuccess("Announcement deleted ✅");
            }
        } catch (err) {
            setError("Failed to delete announcement");
        } finally {
            setDeleting(null);
        }
    };

    const getStaffName = (memberId: number) => {
        const staff = staffList.find((s) => s.id === memberId);
        return staff?.customers?.name || staff?.customers?.email || `Member #${memberId}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const unreadCount = announcements.filter(
        (a) => !a.read_by?.includes(currentMemberId)
    ).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading announcements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                        <p className="text-sm text-gray-500">
                            {isAdmin
                                ? "Send messages to your staff team"
                                : unreadCount > 0
                                ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                                : "All caught up!"}
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-md hover:bg-primary-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {showForm ? (
                            <><X className="w-4 h-4" /> Cancel</>
                        ) : (
                            <><Plus className="w-4 h-4" /> New Announcement</>
                        )}
                    </button>
                )}
            </div>

            {/* Status Messages */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                    <button onClick={() => setSuccess("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Compose Form (Admin Only) */}
            {isAdmin && showForm && (
                <div className="bg-white border border-primary-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary-600" />
                        Compose Announcement
                    </h2>
                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Announcement title..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your announcement message..."
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Send to</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setTarget("all"); setTargetMemberId(null); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                                        target === "all"
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <Users className="w-4 h-4" /> All Staff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTarget("specific")}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                                        target === "specific"
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <User className="w-4 h-4" /> Specific Member
                                </button>
                            </div>
                        </div>
                        {target === "specific" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff Member</label>
                                <select
                                    value={targetMemberId || ""}
                                    onChange={(e) => setTargetMemberId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                                >
                                    <option value="">-- Select a staff member --</option>
                                    {staffList.map((staff) => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.customers?.name || staff.customers?.email} ({staff.customers?.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-md hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                {sending ? "Sending..." : "Send Announcement"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {editingId !== null && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Pencil className="w-5 h-5 text-primary-600" />
                                    Edit Announcement
                                </h2>
                                <button onClick={() => setEditingId(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={editMessage}
                                    onChange={(e) => setEditMessage(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={editSaving}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {editSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-5">
                        <Megaphone className="w-10 h-10 text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No announcements yet</h3>
                    <p className="text-sm text-gray-500 text-center max-w-sm">
                        {isAdmin
                            ? "Create your first announcement to keep your staff informed."
                            : "You're all caught up! No announcements at the moment."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {announcements.map((announcement) => {
                        const isRead = announcement.read_by?.includes(currentMemberId);
                        const isExpanded = expandedId === announcement.id;
                        const reactions = announcement.reactions || {};
                        const hasReactions = Object.keys(reactions).length > 0;

                        return (
                            <div
                                key={announcement.id}
                                className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                                    !isRead && !isAdmin
                                        ? "border-primary-300 shadow-md ring-1 ring-primary-100"
                                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }`}
                            >
                                {/* Unread accent bar */}
                                {!isRead && !isAdmin && (
                                    <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-300" />
                                )}

                                <div
                                    className="p-5 cursor-pointer"
                                    onClick={() => handleExpand(announcement)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {/* Avatar / Read indicator */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                !isRead && !isAdmin
                                                    ? "bg-primary-100 text-primary-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}>
                                                <Megaphone className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className={`text-base font-semibold leading-tight ${
                                                        !isRead && !isAdmin ? "text-gray-900" : "text-gray-700"
                                                    }`}>
                                                        {announcement.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        announcement.target === "all"
                                                            ? "bg-primary-50 text-primary-700 border border-primary-200"
                                                            : "bg-purple-50 text-purple-700 border border-purple-200"
                                                    }`}>
                                                        {announcement.target === "all" ? (
                                                            <><Users className="w-3 h-3" /> All Staff</>
                                                        ) : (
                                                            <><User className="w-3 h-3" /> {isAdmin ? getStaffName(announcement.target_member_id!) : "You"}</>
                                                        )}
                                                    </span>
                                                    {!isRead && !isAdmin && (
                                                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                    )}
                                                </div>

                                                {/* Message preview or full */}
                                                <p className={`text-sm leading-relaxed ${
                                                    isExpanded
                                                        ? "text-gray-700 whitespace-pre-wrap"
                                                        : "text-gray-500 line-clamp-2"
                                                }`}>
                                                    {announcement.message}
                                                </p>

                                                {/* Meta info */}
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(announcement.created_at)}
                                                    </span>
                                                    {isAdmin && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Read by {announcement.read_by?.length || 0}
                                                        </span>
                                                    )}
                                                    {!isRead && !isAdmin && (
                                                        <span className="text-xs font-medium text-primary-600">New</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Admin actions */}
                                        {isAdmin && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(announcement); }}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(announcement.id); }}
                                                    disabled={deleting === announcement.id}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className={`w-4 h-4 ${deleting === announcement.id ? "animate-spin" : ""}`} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reactions bar */}
                                {(isExpanded || hasReactions) && (
                                    <div className="px-5 pb-4 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                        {/* Existing reactions */}
                                        {Object.entries(reactions).map(([emoji, memberIds]) => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReaction(announcement.id, emoji)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                                                    memberIds.includes(currentMemberId)
                                                        ? "bg-primary-50 border-primary-300 text-primary-700"
                                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                                }`}
                                            >
                                                <span className="text-base">{emoji}</span>
                                                <span className="font-medium text-xs">{memberIds.length}</span>
                                            </button>
                                        ))}

                                        {/* Add reaction button */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setReactionPickerId(
                                                    reactionPickerId === announcement.id ? null : announcement.id
                                                )}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm bg-gray-50 border border-dashed border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-400 transition-all"
                                            >
                                                <SmilePlus className="w-4 h-4" />
                                            </button>

                                            {/* Emoji picker popup */}
                                            {reactionPickerId === announcement.id && (
                                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex gap-1 z-10 animate-in fade-in slide-in-from-bottom-2">
                                                    {REACTION_EMOJIS.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReaction(announcement.id, emoji)}
                                                            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-transform hover:scale-110"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AnnouncementsScreen;
