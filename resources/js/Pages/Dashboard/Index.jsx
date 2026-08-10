import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import {
    Package, MapPin, Building2, ClipboardCheck, Users,
    TrendingUp, AlertTriangle, XCircle, Info,
    CheckCircle2, Activity, Clock, ArrowRight,
    ShieldAlert, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
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

const COLORS = {
    Good: '#10b981', // emerald-500
    Fair: '#f59e0b', // amber-500
    Poor: '#f43f5e', // rose-500
    Active: '#10b981',
    Inactive: '#64748b',
    Lost: '#f43f5e',
    Broken: '#f59e0b',
    Default: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa']
};

const getColor = (name, index) => {
    if (COLORS[name]) return COLORS[name];
    return COLORS.Default[index % COLORS.Default.length];
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, gradient, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm ${gradient}`}
    >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Icon size={22} className="text-white" />
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium text-white/70 truncate">{title}</p>
            <h3 className="text-2xl font-bold text-white leading-tight">{value}</h3>
            {sub && <p className="text-xs text-white/50 mt-0.5">{sub}</p>}
        </div>
    </motion.div>
);

const StatCardLight = ({ title, value, sub, icon: Icon, iconClass, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-gray-600">{fmt(payload[0]?.value)} aset</p>
            </div>
        );
    }
    return null;
};

const DONUT_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#06b6d4'];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ stats, charts, recentActivity, alerts }) {
    const { settings } = usePage().props;
    const progress = stats?.audit_progress ?? 0;
    const orgName = settings?.company_name || settings?.hotel_name || 'Organisasi';
    const barColors = ['#000000', '#27272a', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#18181b', '#3f3f46'];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">{orgName} — ringkasan status aset dan audit.</p>
                    </div>
                    {stats?.active_session && (
                        <Link
                            href={`/audit-sessions/${stats.active_session.id}/conduct`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            <Loader2 size={15} className="animate-spin" />
                            Audit Berjalan: {stats.active_session.name}
                            <ArrowRight size={14} />
                        </Link>
                    )}
                </div>

                <AlertPanel alerts={alerts} />

                {/* Stats Row 1 — gradient */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard title="Total Aset" value={fmt(stats?.total_assets)} sub={`+${stats?.new_assets_this_month ?? 0} bln ini`}
                        icon={Package} gradient="bg-gradient-to-br from-gray-900 to-gray-700" delay={0.04} />
                    <StatCard title="Aset Aktif" value={fmt(stats?.active_assets)}
                        icon={CheckCircle2} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" delay={0.08} />
                    <StatCard title="Tidak Aktif" value={fmt(stats?.inactive_assets)}
                        icon={ShieldAlert} gradient="bg-gradient-to-br from-slate-400 to-slate-600" delay={0.12} />
                    <StatCard title="Aset Hilang" value={fmt(stats?.lost_assets)}
                        icon={AlertTriangle} gradient="bg-gradient-to-br from-red-500 to-red-700" delay={0.16} />
                    <StatCard title="Aset Rusak" value={fmt(stats?.broken_assets)}
                        icon={XCircle} gradient="bg-gradient-to-br from-orange-500 to-orange-700" delay={0.20} />
                    <StatCard title="Pengguna" value={fmt(stats?.total_users)}
                        icon={Users} gradient="bg-gradient-to-br from-violet-500 to-violet-700" delay={0.24} />
                </div>

                {/* Stats Row 2 — light */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCardLight title="Lokasi" value={fmt(stats?.total_locations)}
                        icon={MapPin} iconClass="bg-blue-50 text-blue-600" delay={0.28} />
                    <StatCardLight title="Departemen" value={fmt(stats?.total_departments)}
                        icon={Building2} iconClass="bg-purple-50 text-purple-600" delay={0.32} />
                    <StatCardLight title="Total Sesi Audit" value={fmt(stats?.total_sessions)}
                        sub={`${stats?.completed_sessions ?? 0} selesai`}
                        icon={ClipboardCheck} iconClass="bg-green-50 text-green-600" delay={0.36} />
                    <StatCardLight title="Progress Audit" value={`${progress}%`}
                        sub="audit berjalan" icon={Activity} iconClass="bg-amber-50 text-amber-600" delay={0.40} />
                </div>

                {/* Financial + Audit Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Financial */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 60%)' }} />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp size={20} className="opacity-70" />
                                <p className="font-semibold text-sm opacity-70">Ringkasan Finansial</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs opacity-50 mb-1">Total Nilai Perolehan</p>
                                    <p className="text-xl font-bold">{fmtCurrency(stats?.total_acquisition)}</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-xs opacity-50 mb-1">Total Nilai Buku</p>
                                    <p className="text-xl font-bold">{fmtCurrency(stats?.total_book_value)}</p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-xs opacity-50 mb-1">Total Depresiasi</p>
                                    <p className="text-lg font-semibold text-red-300">{fmtCurrency(stats?.depreciation_value)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Progress */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardCheck size={20} className="text-black" />
                            <h3 className="font-bold text-gray-900">Progres Audit</h3>
                            {stats?.active_session && (
                                <span className="ml-auto text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full font-medium">
                                    {stats.active_session.name}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                                {fmt(stats?.audited_count)} dari {fmt(stats?.total_assets)} aset diaudit
                            </span>
                            <span className="text-2xl font-bold text-black">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                            <motion.div
                                className="bg-black h-3 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-black font-medium">Sudah Audit</p>
                                <p className="text-xl font-bold text-gray-900">{fmt(stats?.audited_count)}</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Monthly Trend - Area Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold text-gray-900">Tren Penambahan Aset</h3>
                            <span className="ml-auto text-xs text-gray-400">6 bulan terakhir</span>
                        </div>
                        {charts?.monthly_trend?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={charts.monthly_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#18181b" strokeWidth={2.5}
                                        fill="url(#areaGrad)" dot={{ fill: '#18181b', r: 4 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">Belum ada data tren</div>
                        )}
                    </div>

                    {/* By Department - Horizontal Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Aset per Departemen</h3>
                        {charts?.by_department?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={charts.by_department.slice(0,6)} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#18181b" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">Belum ada data departemen</div>
                        )}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Condition Donut */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Kondisi Aset</h3>
                        {charts?.by_condition?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={charts.by_condition} dataKey="count" nameKey="name"
                                        cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                        {charts.by_condition.map((entry, i) => (
                                            <Cell key={i} fill={getColor(entry.name, i)} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [fmt(v), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                                Belum ada data kondisi
                            </div>
                        )}
                    </div>

                    {/* Status Donut */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Status Aset</h3>
                        {charts?.by_status?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={charts.by_status} dataKey="count" nameKey="name"
                                        cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                        {charts.by_status.map((entry, i) => (
                                            <Cell key={i} fill={getColor(entry.name, i)} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [fmt(v), 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
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
                            <Activity size={18} className="text-black" />
                            <h3 className="font-bold text-gray-900">Aktivitas Terbaru</h3>
                        </div>
                        <div className="space-y-3">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.slice(0, 7).map((log) => (
                                    <div key={log.id} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
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
                                className="mt-4 flex items-center justify-center gap-1 text-xs text-black hover:text-black font-medium border-t border-gray-100 pt-3"
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
