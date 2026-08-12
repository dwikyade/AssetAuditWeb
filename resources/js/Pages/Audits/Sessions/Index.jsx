import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Select } from '@/Components/UI';
import { Search, Plus, Eye, Play, Calendar, BarChart2, ClipboardCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const fmtDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDuration = (start, end) => {
    if (!start || !end) return null;
    const days = Math.ceil((new Date(end) - new Date(start)) / 86400000);
    return `${days} hari`;
};

const statusConfig = {
    draft:       { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400',   label: 'Draft' },
    scheduled:   { bg: 'bg-blue-50',  text: 'text-blue-700', dot: 'bg-blue-500',   label: 'Dijadwalkan' },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Sedang Berjalan' },
    completed:   { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Selesai' },
    cancelled:   { bg: 'bg-red-50',   text: 'text-red-700',  dot: 'bg-red-500',    label: 'Dibatalkan' },
};

const StatusBadge = ({ status }) => {
    const s = statusConfig[status] || statusConfig.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

export default function AuditSessionIndex({ sessions, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                router.get('/audit-sessions', { ...filters, search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters]);

    return (
        <AppLayout>
            <Head title="Sesi Audit / Stock Opname" />

            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sesi Audit / Stock Opname</h1>
                        <p className="text-sm text-gray-500">Kelola jadwal dan pelaksanaan pengecekan fisik aset.</p>
                    </div>
                    <Button onClick={() => router.get('/audit-sessions/create')}>
                        <Plus size={16} className="mr-2" />
                        Buat Sesi Audit Baru
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 max-w-md">
                        <Input
                            type="text"
                            placeholder="Cari nama atau kode sesi..."
                            icon={Search}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-auto shrink-0">
                        <Select
                            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-gray-900 min-w-[180px]"
                            value={filters?.status || ''}
                            onChange={(e) => router.get('/audit-sessions', { ...filters, status: e.target.value })}
                        >
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Dijadwalkan</option>
                            <option value="in_progress">Sedang Berjalan</option>
                            <option value="completed">Selesai</option>
                        </Select>
                    </div>
                </div>

                {/* Sessions List */}
                {sessions.data.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                        <ClipboardCheck size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">Belum ada sesi audit.</p>
                        <p className="text-sm text-gray-400 mt-1">Klik tombol di atas untuk membuat sesi baru.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.data.map((session, idx) => {
                            const s = statusConfig[session.status] || statusConfig.draft;
                            const totalScope = session.total_scope || 0;
                            const auditedCount = session.unique_audits_count ?? session.audits_count ?? 0;
                            const progress = session.progress_percent !== undefined
                                ? Math.min(100, Math.round(session.progress_percent))
                                : (totalScope > 0 ? Math.min(100, Math.round((auditedCount / totalScope) * 100)) : 0);

                            return (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-gray-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Left - Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                                                    <ClipboardCheck size={18} className={s.text} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-gray-900 text-base">{session.name}</h3>
                                                        <StatusBadge status={session.status} />
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{session.code}</span>
                                                        <span>Scope: <span className="uppercase font-medium text-gray-600">{session.scope_type}</span></span>
                                                    </div>
                                                    {session.description && (
                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{session.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center - Schedule */}
                                        <div className="lg:w-52 shrink-0">
                                            <p className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1">
                                                <Calendar size={11} /> Jadwal Pelaksanaan
                                            </p>
                                            {session.start_date ? (
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-semibold text-gray-800">
                                                        {fmtDate(session.start_date)}
                                                    </div>
                                                    {session.end_date && (
                                                        <div className="text-xs text-gray-500">
                                                            s/d {fmtDate(session.end_date)}
                                                            {getDuration(session.start_date, session.end_date) && (
                                                                <span className="ml-1.5 bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                                    {getDuration(session.start_date, session.end_date)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Belum diatur</span>
                                            )}
                                        </div>

                                        {/* Center - Progress */}
                                        <div className="lg:w-44 shrink-0">
                                            <p className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1">
                                                <BarChart2 size={11} /> Progres Audit
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${session.status === 'completed' ? 'bg-green-500' : 'bg-gray-800'}`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 w-8 text-right">{progress}%</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {auditedCount} dari {totalScope} aset
                                                {session.status === 'completed' && session.found_count != null && (
                                                    <span className="text-green-600 ml-1">· {session.found_count} ditemukan</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Right - Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {session.status === 'in_progress' && (
                                                <Button size="sm" onClick={() => router.get(`/audit-sessions/${session.id}/conduct`)}>
                                                    <Play size={13} className="mr-1.5" />
                                                    Lanjutkan
                                                </Button>
                                            )}
                                            {session.status === 'draft' && (
                                                <Button size="sm" onClick={() => router.get(`/audit-sessions/${session.id}/edit`)}>
                                                    Mulai Setup
                                                </Button>
                                            )}
                                            <Button variant="secondary" size="sm" onClick={() => router.get(`/audit-sessions/${session.id}`)}>
                                                <Eye size={13} className="mr-1.5" />
                                                Detail
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {sessions.links && sessions.last_page > 1 && (
                    <div className="flex justify-center gap-1 pt-2">
                        {sessions.links.map((link, i) => (
                            link.url ? (
                                <Link key={i} href={link.url}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span key={i} className="px-3 py-1.5 rounded-lg text-sm text-gray-300 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
