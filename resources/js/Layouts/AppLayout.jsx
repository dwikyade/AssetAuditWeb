import { usePage, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, ClipboardList, FileUp,
    BarChart3, Users, Settings, LogOut, ChevronLeft,
    Bell, ChevronDown, Building2, Tag, MapPin, Hash,
    Activity, Shield
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { ConfirmDialogProvider } from '@/Components/ConfirmDialog';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        this.setState({ error, info });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 m-8 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <h1 className="text-xl font-bold mb-4">React Runtime Error</h1>
                    <pre className="whitespace-pre-wrap text-sm mb-4">{this.state.error?.toString()}</pre>
                    <pre className="whitespace-pre-wrap text-xs bg-red-100 p-4 rounded">{this.state.info?.componentStack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

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
        permission: null,
        roles: ['super_admin'],
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
        roles: ['super_admin'],
    },
];

export default function AppLayout({ children }) {
    const { auth, app, flash, settings } = usePage().props;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [toasts, setToasts] = useState([]);

    const user = auth?.user;
    const permissions = user?.permissions ?? [];
    const roles = user?.roles ?? [];

    // Handle flash messages as toasts
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

    const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    useEffect(() => {
        toasts.forEach(t => {
            const timer = setTimeout(() => dismissToast(t.id), 5000);
            return () => clearTimeout(timer);
        });
    }, [toasts]);

    const canSee = (item) => {
        if (item.roles && !item.roles.some(r => roles.includes(r))) return false;
        if (item.permission && !permissions.includes(item.permission)) return false;
        return true;
    };

    const path = window.location.pathname;
    const getActiveHref = () => {
        let match = '';
        navItems.forEach(item => {
            if (item.href && (path === item.href || path.startsWith(item.href + '/'))) {
                if (item.href.length > match.length) match = item.href;
            }
            if (item.children) {
                item.children.forEach(child => {
                    if (child.href && (path === child.href || path.startsWith(child.href + '/'))) {
                        if (child.href.length > match.length) match = child.href;
                    }
                });
            }
        });
        return match;
    };
    const activeHref = getActiveHref();

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <ErrorBoundary>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 64 : 256 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col flex-shrink-0 h-full"
                style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
            >
                {/* Logo area */}
                <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
                    {!sidebarCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                HA
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

                {/* Navigation */}
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
                        const active = item.href === activeHref || (item.children && item.children.some(c => c.href === activeHref));
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
                                                            className={cn('sidebar-item text-xs', child.href === activeHref && 'active')}
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

                {/* User footer */}
                <div className="p-3 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }}>
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {getInitials(user?.name ?? 'U')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--color-sidebar-text)' }}>{user?.roles?.[0]}</p>
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
                        <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <Bell size={18} />
                        </button>
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
                    <ConfirmDialogProvider />
                </main>
            </div>

            {/* Toast notifications */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={cn(
                                'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm max-w-sm',
                                toast.type === 'success' && 'bg-green-50 text-green-800 border border-green-200',
                                toast.type === 'error' && 'bg-red-50 text-red-800 border border-red-200',
                                toast.type === 'warning' && 'bg-yellow-50 text-yellow-800 border border-yellow-200',
                                toast.type === 'info' && 'bg-blue-50 text-blue-800 border border-blue-200',
                            )}
                        >
                            <span className="flex-1">{toast.msg}</span>
                            <button onClick={() => dismissToast(toast.id)} className="text-gray-400 hover:text-gray-600 shrink-0">×</button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

            {/* Watermark */}
            <div className="fixed bottom-4 right-6 z-10 pointer-events-none select-none text-right" style={{ filter: 'blur(0.5px)', opacity: 0.08 }}>
                <p className="text-gray-900 font-black text-2xl tracking-widest uppercase leading-tight">
                    {settings?.company_name || settings?.hotel_name || 'Dual Gate'}
                </p>
                <p className="text-gray-900 font-semibold text-sm tracking-wider">
                    {settings?.app_name || app?.name || 'Asset Audit'}
                </p>
            </div>
        </ErrorBoundary>
    );
}
