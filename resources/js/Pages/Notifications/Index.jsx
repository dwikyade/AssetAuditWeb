import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCircle2, XCircle, AlertTriangle, Info,
    Check, Trash2, ExternalLink, BellOff, Filter,
    CheckCheck
} from 'lucide-react';
import { useState } from 'react';
import { cn, formatRelativeTime } from '@/lib/utils';

const typeConfig = {
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500', label: 'Berhasil' },
    error:   { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', dot: 'bg-rose-500', label: 'Gagal' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-500', label: 'Peringatan' },
    info:    { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-500', label: 'Informasi' },
};

const filterOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'unread', label: 'Belum Dibaca' },
    { value: 'read', label: 'Sudah Dibaca' },
];

export default function NotificationsIndex({ notifications }) {
    const [filter, setFilter] = useState('all');
    const [deletingIds, setDeletingIds] = useState(new Set());

    const items = notifications?.data ?? [];

    const filteredItems = items.filter(n => {
        if (filter === 'unread') return !n.read_at;
        if (filter === 'read') return !!n.read_at;
        return true;
    });

    const handleMarkAsRead = async (id) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            router.reload({ only: ['notifications', 'notificationCount'] });
        } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            router.reload({ only: ['notifications', 'notificationCount'] });
        } catch { /* silent */ }
    };

    const handleDelete = async (id) => {
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            await fetch(`/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            router.reload({ only: ['notifications', 'notificationCount'] });
        } catch {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const unreadCount = items.filter(n => !n.read_at).length;

    return (
        <AppLayout>
            <Head title="Notifikasi" />

            <div className="p-6 lg:p-8 w-full max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center">
                            <Bell size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                            <p className="text-sm text-gray-500">
                                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <CheckCheck size={16} />
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-xl transition-all",
                                filter === opt.value
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                <BellOff size={28} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400">Tidak ada notifikasi</p>
                            <p className="text-xs text-gray-300 mt-1">
                                {filter !== 'all' ? 'Coba ubah filter untuk melihat notifikasi lain' : 'Notifikasi baru akan muncul di sini'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {filteredItems.map((notif, index) => {
                                    const config = typeConfig[notif.type] ?? typeConfig.info;
                                    const Icon = config.icon;
                                    const isUnread = !notif.read_at;
                                    const isDeleting = deletingIds.has(notif.id);

                                    return (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                                            transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                                            className={cn(
                                                "group relative flex items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50/50",
                                                isUnread && "bg-blue-50/20"
                                            )}
                                        >
                                            {isUnread && (
                                                <div className={cn("absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full", config.dot)} />
                                            )}

                                            <div className={cn("flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 mt-0.5", config.bg)}>
                                                <Icon size={20} className={config.color} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={cn(
                                                                "text-sm leading-snug",
                                                                isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"
                                                            )}>
                                                                {notif.title}
                                                            </p>
                                                            <span className={cn(
                                                                "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wide",
                                                                config.bg, config.color
                                                            )}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(notif.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                                                {isUnread && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="Tandai dibaca"
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                )}
                                                {notif.link && (
                                                    <Link
                                                        href={notif.link}
                                                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                        title="Lihat detail"
                                                    >
                                                        <ExternalLink size={15} />
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notif.id)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Hapus"
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {notifications?.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {notifications.links?.map((link, i) => {
                            if (!link.url) return null;
                            let label = link.label;
                            if (label.includes('Previous')) label = 'Prev';
                            if (label.includes('Next')) label = 'Next';
                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                        link.active
                                            ? "bg-gray-900 text-white"
                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
