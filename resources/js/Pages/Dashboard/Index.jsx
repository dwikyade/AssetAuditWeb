import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    Package, MapPin, Building2, ClipboardCheck,
    TrendingUp, AlertTriangle, XCircle, Info,
    CheckCircle2, Activity, Clock, ArrowRight,
    ShieldAlert, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString('id-ID');
const fmtCurrency = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n ?? 0);

const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, colorClass, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon size={22} />
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{value}</h3>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </motion.div>
);

// ─── Alert Panel ─────────────────────────────────────────────────────────────
const alertStyles = {
    error:   { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: XCircle, iconColor: 'text-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
    info:    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
};

const AlertPanel = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
        >
            {alerts.map((alert, i) => {
                const s = alertStyles[alert.type] ?? alertStyles.info;
                const Icon = s.icon;
                return (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${s.bg} ${s.border} ${s.text}`}>
                        <Icon size={16} className={`shrink-0 ${s.iconColor}`} />
                        <span className="flex-1">{alert.message}</span>
                        {alert.link && (
                            <Link href={alert.link} className="shrink-0 font-medium underline underline-offset-2 opacity-70 hover:opacity-100">
                                Lihat
                            </Link>
                        )}
                    </div>
                );
            })}
        </motion.div>
    );
};

// ─── Pie Custom Label ─────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ stats, charts, recentActivity, alerts }) {
    const progress = stats?.audit_progress ?? 0;
    const barColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">Ringkasan status aset dan audit hotel.</p>
                    </div>
                    {stats?.active_session && (
                        <Link
                            href={`/audit-sessions/${stats.active_session.id}/conduct`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Loader2 size={15} className="animate-spin" />
                            Audit Berjalan: {stats.active_session.name}
                            <ArrowRight size={14} />
                        </Link>
                    )}
                </div>

                {/* Alerts */}
                <AlertPanel alerts={alerts} />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title="Total Aset" value={fmt(stats?.total_assets)} icon={Package}
                        colorClass="bg-indigo-100 text-indigo-600" delay={0.05} />
                    <StatCard title="Aset Aktif" value={fmt(stats?.active_assets)} icon={CheckCircle2}
                        colorClass="bg-emerald-100 text-emerald-600" delay={0.1} />
                    <StatCard title="Tidak Aktif" value={fmt(stats?.inactive_assets)} icon={ShieldAlert}
                        colorClass="bg-gray-100 text-gray-500" delay={0.15} />
                    <StatCard title="Aset Hilang" value={fmt(stats?.lost_assets)} icon={AlertTriangle}
                        colorClass="bg-red-100 text-red-500" delay={0.2} />
                    <StatCard title="Aset Rusak" value={fmt(stats?.broken_assets)} icon={XCircle}
                        colorClass="bg-orange-100 text-orange-500" delay={0.25} />
                </div>

                {/* Financial + Audit Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Financial */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="opacity-80" />
                            <p className="font-semibold text-sm opacity-80">Ringkasan Finansial</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs opacity-70">Total Nilai Perolehan</p>
                                <p className="text-xl font-bold">{fmtCurrency(stats?.total_acquisition)}</p>
                            </div>
                            <div className="border-t border-white/20 pt-4">
                                <p className="text-xs opacity-70">Total Nilai Buku</p>
                                <p className="text-xl font-bold">{fmtCurrency(stats?.total_book_value)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Audit Progress */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardCheck size={20} className="text-indigo-600" />
                            <h3 className="font-bold text-gray-900">Progres Audit</h3>
                            {stats?.active_session && (
                                <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                    {stats.active_session.name}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                                {fmt(stats?.audited_count)} dari {fmt(stats?.total_assets)} aset diaudit
                            </span>
                            <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                            <motion.div
                                className="bg-indigo-600 h-3 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-indigo-50 rounded-lg p-3">
                                <p className="text-xs text-indigo-600 font-medium">Sudah Audit</p>
                                <p className="text-xl font-bold text-indigo-700">{fmt(stats?.audited_count)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 font-medium">Belum Audit</p>
                                <p className="text-xl font-bold text-gray-700">{fmt(stats?.not_audited_count)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3">
                                <p className="text-xs text-emerald-600 font-medium">Progres</p>
                                <p className="text-xl font-bold text-emerald-700">{progress}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Category */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Aset per Kategori</h3>
                        {charts?.by_category?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={charts.by_category} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [fmt(v), 'Jumlah Aset']} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {charts.by_category.map((_, i) => (
                                            <Cell key={i} fill={barColors[i % barColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                                Belum ada data kategori
                            </div>
                        )}
                    </div>

                    {/* By Department */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Aset per Departemen</h3>
                        {charts?.by_department?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={charts.by_department} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [fmt(v), 'Jumlah Aset']} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {charts.by_department.map((_, i) => (
                                            <Cell key={i} fill={barColors[(i + 2) % barColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                                Belum ada data departemen
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Condition Pie */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Kondisi Aset</h3>
                        {charts?.by_condition?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={charts.by_condition}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {charts.by_condition.map((entry, i) => (
                                            <Cell key={i} fill={entry.color || barColors[i % barColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, name) => [fmt(v), name]} />
                                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                                Belum ada data kondisi
                            </div>
                        )}
                    </div>

                    {/* Status Pie */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Status Aset</h3>
                        {charts?.by_status?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={charts.by_status}
                                        dataKey="count"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {charts.by_status.map((entry, i) => (
                                            <Cell key={i} fill={entry.color || barColors[i % barColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, name) => [fmt(v), name]} />
                                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                                Belum ada data status
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-gray-900">Aktivitas Terbaru</h3>
                        </div>
                        <div className="space-y-3">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.slice(0, 7).map((log) => (
                                    <div key={log.id} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-800 leading-snug line-clamp-2">{log.description}</p>
                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                                                <Clock size={10} />
                                                <span>{timeAgo(log.created_at)}</span>
                                                {log.user && <span>· {log.user}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">Belum ada aktivitas tercatat.</p>
                            )}
                        </div>
                        {recentActivity && recentActivity.length > 0 && (
                            <Link
                                href="/activity-logs"
                                className="mt-4 flex items-center justify-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium border-t border-gray-100 pt-3"
                            >
                                Lihat semua aktivitas <ArrowRight size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
