import { usePage, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, ClipboardList, FileUp,
    BarChart3, Users, Settings, LogOut, ChevronLeft,
    Bell, ChevronDown, Building2, Tag, MapPin, Hash,
    Activity, Shield, CheckCircle2, XCircle, AlertTriangle,
    Info, X, Check, ExternalLink, Trash2, BellOff, Camera, QrCode
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';
import QrScannerModal from '@/Components/QrScannerModal';

const navItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
        permission: null,
    },
    {
        label: 'Aset',
        icon: Package,
        href: '/assets',
        permission: 'asset.view',
        children: [
            { label: 'Semua Aset', href: '/assets' },
            { label: 'Tambah Aset', href: '/assets/create', permission: 'asset.create' },
        ],
    },
    {
        label: 'Audit',
        icon: ClipboardList,
        href: '/audit-sessions',
        permission: 'audit.view',
        children: [
            { label: 'Audit Sessions', href: '/audit-sessions' },
            { label: 'Buat Session', href: '/audit-sessions/create', permission: 'audit.create' },
        ],
    },
    {
        label: 'Import & Export',
        icon: FileUp,
        href: '/import',
        permission: 'asset.import',
        children: [
            { label: 'Import Aset', href: '/import', permission: 'asset.import' },
            { label: 'Export Data', href: '/export', permission: 'asset.import' },
            { label: 'Export QR Code', href: '/export/qr', permission: 'asset.view' },
        ],
    },
    {
        label: 'Laporan',
        icon: BarChart3,
        href: '/reports',
        permission: 'report.view',
    },
    {
        divider: true,
        label: 'Master Data',
    },
    {
        label: 'Kategori',
        icon: Tag,
        href: '/categories',
        permission: 'category.manage',
    },
    {
        label: 'Departemen',
        icon: Building2,
        href: '/departments',
        permission: 'department.manage',
    },
    {
        label: 'Lokasi',
        icon: MapPin,
        href: '/locations',
        permission: 'location.manage',
    },
    {
        label: 'Kode Aset',
        icon: Hash,
        href: '/asset-code-prefixes',
        permission: 'prefix.manage',
    },
    {
        divider: true,
        label: 'Admin',
    },
    {
        label: 'Pengguna',
        icon: Users,
        href: '/users',
        permission: 'user.view',
    },
    {
        label: 'Roles & Permissions',
        icon: Shield,
        href: '/roles',
        permission: 'system.manage',
    },
    {
        label: 'Activity Log',
        icon: Activity,
        href: '/activity-logs',
        permission: 'activity-log.view',
    },
    {
        label: 'Pengaturan',
        icon: Settings,
        href: '/settings',
        permission: 'system.manage',
    },
];

const TOAST_DURATION = 5000;

const toastConfig = {
    success: {
        icon: CheckCircle2,
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        iconColor: 'text-emerald-500',
        progressColor: 'bg-emerald-500',
    },
    error: {
        icon: XCircle,
        gradient: 'from-rose-500 to-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-800',
        iconColor: 'text-rose-500',
        progressColor: 'bg-rose-500',
    },
    warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        iconColor: 'text-amber-500',
        progressColor: 'bg-amber-500',
    },
    info: {
        icon: Info,
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconColor: 'text-blue-500',
        progressColor: 'bg-blue-500',
    },
};

const notifTypeConfig = {
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
    error:   { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', dot: 'bg-rose-500' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    info:    { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-500' },
};

const ToastItem = ({ toast, onDismiss }) => {
    const config = toastConfig[toast.type] ?? toastConfig.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto w-[380px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100/80"
        >
            <div className="relative flex items-start gap-3 p-4">
                <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
                    config.bg
                )}>
                    <Icon size={20} strokeWidth={2} className={config.iconColor} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className={cn("text-sm font-semibold", config.text)}>
                        {toast.type === 'success' ? 'Berhasil' :
                         toast.type === 'error' ? 'Gagal' :
                         toast.type === 'warning' ? 'Perhatian' : 'Informasi'}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{toast.msg}</p>
                </div>
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="shrink-0 p-1 rounded-lg text-gray-300 transition-all hover:text-gray-500 hover:bg-gray-100"
                >
                    <X size={16} />
                </button>
            </div>
            <motion.div
                className={cn("h-1 rounded-full", config.progressColor)}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
            />
        </motion.div>
    );
};

const NotificationDropdown = ({ isOpen, onClose, dropdownRef }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/notifications/recent', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch { /* silent */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

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
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
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
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const removed = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (removed && !removed.read_at) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute right-0 top-full mt-2 z-50 w-[400px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
                                {unreadCount > 0 && (
                                    <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <Check size={12} />
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-[420px] overflow-y-auto overscroll-contain">
                            {loading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                                        <BellOff size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-400">Tidak ada notifikasi</p>
                                    <p className="text-xs text-gray-300 mt-1">Notifikasi baru akan muncul di sini</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map(notif => {
                                        const config = notifTypeConfig[notif.type] ?? notifTypeConfig.info;
                                        const Icon = config.icon;
                                        const isUnread = !notif.read_at;
                                        return (
                                            <motion.div
                                                key={notif.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={cn(
                                                    "group relative flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/80",
                                                    isUnread && "bg-blue-50/30"
                                                )}
                                            >
                                                {isUnread && (
                                                    <div className={cn("absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full", config.dot)} />
                                                )}
                                                <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5", config.bg)}>
                                                    <Icon size={16} className={config.color} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm leading-snug", isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                    <p className="text-[11px] text-gray-400 mt-1">{formatRelativeTime(notif.created_at)}</p>
                                                </div>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                                                    {isUnread && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Tandai dibaca"
                                                        >
                                                            <Check size={13} />
                                                        </button>
                                                    )}
                                                    {notif.link && (
                                                        <Link
                                                            href={notif.link}
                                                            onClick={(e) => { e.stopPropagation(); if (isUnread) handleMarkAsRead(notif.id); onClose(); }}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                            title="Lihat detail"
                                                        >
                                                            <ExternalLink size={13} />
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-5 py-3">
                            <Link
                                href="/notifications"
                                onClick={onClose}
                                className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Lihat semua notifikasi
                                <ExternalLink size={11} />
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default function AppLayout({ children }) {
    const { auth, app, flash, notificationCount, settings } = usePage().props;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [toasts, setToasts] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [qrScannerOpen, setQrScannerOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(notificationCount ?? 0);
    const notifRef = useRef(null);

    const user = auth?.user;
    const permissions = user?.permissions ?? [];
    const roles = user?.roles ?? [];
    const appName = app?.name || 'Asset Sync';
    const orgName = settings?.company_name || settings?.hotel_name || 'Asset Management System';

    useEffect(() => {
        setUnreadCount(notificationCount ?? 0);
    }, [notificationCount]);

    useEffect(() => {
        const newToasts = [];
        if (flash?.success) newToasts.push({ type: 'success', msg: flash.success });
        if (flash?.error) newToasts.push({ type: 'error', msg: flash.error });
        if (flash?.warning) newToasts.push({ type: 'warning', msg: flash.warning });
        if (flash?.info) newToasts.push({ type: 'info', msg: flash.info });

        if (newToasts.length > 0) {
            setToasts(prev => [...prev, ...newToasts.map((t, i) => ({ ...t, id: Date.now() + i }))]);
        }
    }, [flash]);

    const dismissToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    useEffect(() => {
        const timers = toasts.map(t =>
            setTimeout(() => dismissToast(t.id), TOAST_DURATION)
        );
        return () => timers.forEach(clearTimeout);
    }, [toasts, dismissToast]);

    const canSee = (item) => {
        if (item.roles && !item.roles.some(r => roles.includes(r))) return false;
        if (item.permission && !permissions.includes(item.permission)) return false;
        return true;
    };

    const isActive = (href) => {
        return window.location.pathname === href || window.location.pathname.startsWith(href + '/');
    };

    const isParentActive = (item) => {
        if (!item.children) return isActive(item.href);
        return item.children.some(c => isActive(c.href));
    };

    useEffect(() => {
        navItems.forEach(item => {
            if (item.children && item.children.some(c => isActive(c.href))) {
                setOpenMenus(prev => ({ ...prev, [item.label]: true }));
            }
        });
    }, []);

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 64 : 256 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col flex-shrink-0 h-full"
                style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
                    {!sidebarCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                AS
                            </div>
                            <div className="leading-tight">
                                <p className="text-white font-semibold text-sm">{app?.name ?? 'Asset Audit'}</p>
                                <p className="text-xs" style={{ color: 'var(--color-sidebar-text)' }}>Management System</p>
                            </div>
                        </motion.div>
                    )}
                    {sidebarCollapsed && (
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto">
                            HA
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1 rounded-md transition-colors hover:bg-white/10 text-gray-400 hover:text-white"
                        style={{ marginLeft: sidebarCollapsed ? 'auto' : undefined }}
                    >
                        <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
                            <ChevronLeft size={16} />
                        </motion.div>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
                    {navItems.map((item, i) => {
                        if (item.divider) {
                            return (
                                <div key={i} className="pt-3 pb-1">
                                    {!sidebarCollapsed && (
                                        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: 'var(--color-sidebar-text)' }}>
                                            {item.label}
                                        </p>
                                    )}
                                    {sidebarCollapsed && (
                                        <div className="border-t mx-2" style={{ borderColor: 'var(--color-sidebar-border)' }} />
                                    )}
                                </div>
                            );
                        }

                        if (!canSee(item)) return null;

                        const Icon = item.icon;
                        const active = isParentActive(item);
                        const hasChildren = item.children?.filter(c => !c.permission || permissions.includes(c.permission)).length > 0;
                        const isOpen = openMenus[item.label];

                        return (
                            <div key={i}>
                                {hasChildren ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={cn('sidebar-item w-full', active && 'active')}
                                        >
                                            {Icon && <Icon size={18} className="shrink-0" />}
                                            {!sidebarCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left">{item.label}</span>
                                                    <ChevronDown
                                                        size={14}
                                                        className={cn('transition-transform', isOpen && 'rotate-180')}
                                                    />
                                                </>
                                            )}
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && !sidebarCollapsed && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="overflow-hidden pl-7"
                                                >
                                                    {item.children.filter(c => !c.permission || permissions.includes(c.permission)).map((child, j) => (
                                                        <Link
                                                            key={j}
                                                            href={child.href}
                                                            className={cn('sidebar-item text-xs', isActive(child.href) && 'active')}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={cn('sidebar-item', active && 'active')}
                                        title={sidebarCollapsed ? item.label : undefined}
                                    >
                                        {Icon && <Icon size={18} className="shrink-0" />}
                                        {!sidebarCollapsed && <span>{item.label}</span>}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-3 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }}>
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {getInitials(user?.name ?? 'U')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--color-sidebar-text)' }}>{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-semibold">
                                {getInitials(user?.name ?? 'U')}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <nav className="flex items-center text-sm text-gray-500">
                            <Link href="/" className="hover:text-gray-700">Home</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setQrScannerOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white transition-all text-xs font-semibold"
                            title="Scan QR Code Aset"
                        >
                            <Camera size={16} />
                            <span className="hidden sm:inline">Scan QR</span>
                        </button>
                        <div className="w-px h-5 bg-gray-200" />
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className={cn(
                                    "relative p-2 rounded-xl transition-all",
                                    notifOpen
                                        ? "bg-gray-900 text-white shadow-lg"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <Bell size={18} />
                                <AnimatePresence>
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-[18px] min-w-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white"
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px]">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-30" />
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown
                                isOpen={notifOpen}
                                onClose={() => setNotifOpen(false)}
                                dropdownRef={notifRef}
                            />
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-semibold">
                                {getInitials(user?.name ?? 'U')}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Watermark overlay (Activation Style - Bottom Right) */}
            <div className="pointer-events-none fixed bottom-4 right-5 z-40 select-none text-right opacity-30">
                <p className="text-sm font-semibold tracking-wide text-gray-500">{appName}</p>
                <p className="text-xs text-gray-400">{orgName}</p>
            </div>

            {/* QR Scanner Modal */}
            <QrScannerModal
                isOpen={qrScannerOpen}
                onClose={() => setQrScannerOpen(false)}
            />

            {/* Toast notifications */}
            <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex flex-col items-end gap-3 p-6 pt-20">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
