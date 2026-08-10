import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input , Select} from '@/Components/UI';
import { Search, Plus, Eye, Play, StopCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuditSessionIndex({ sessions, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/audit-sessions', { ...filters, search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters]);

    const getStatusBadge = (status) => {
        const map = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
            scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dijadwalkan' },
            in_progress: { bg: 'bg-gray-100', text: 'text-gray-900', label: 'Sedang Berjalan' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' }
        };
        const s = map[status] || map.draft;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    return (
        <AppLayout>
            <Head title="Sesi Audit / Stock Opname" />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Cari nama atau kode sesi..."
                                className="pl-10 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select 
                            className="rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm px-3 py-2 text-sm focus:ring-gray-900"
                            value={filters.status || ''}
                            onChange={(e) => router.get('/audit-sessions', { ...filters, status: e.target.value })}
                        >
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Dijadwalkan</option>
                            <option value="in_progress">Sedang Berjalan</option>
                            <option value="completed">Selesai</option>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Sesi Audit</th>
                                    <th className="px-6 py-3 font-medium">Jadwal</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Progres</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sessions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            Belum ada data sesi audit.
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.data.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{session.name}</div>
                                                <div className="text-xs text-black font-mono mt-0.5">{session.code}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Scope: <span className="uppercase">{session.scope_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {session.start_date ? (
                                                    <div>
                                                        <div className="text-gray-900">{session.start_date}</div>
                                                        {session.end_date && <div className="text-xs text-gray-500">s/d {session.end_date}</div>}
                                                    </div>
                                                ) : <span className="text-gray-400">Belum diatur</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(session.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-xs font-medium text-gray-700 w-16">
                                                        {session.audits_count} aset
                                                    </div>
                                                    {session.status === 'completed' && (
                                                        <div className="flex items-center text-green-600 text-xs">
                                                            <CheckCircle2 size={14} className="mr-1" />
                                                            {session.found_count} Ditemukan
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {session.status === 'in_progress' && (
                                                        <Button size="sm" onClick={() => router.get(`/audit-sessions/${session.id}/conduct`)}>
                                                            <Play size={14} className="mr-2" />
                                                            Lanjutkan Audit
                                                        </Button>
                                                    )}
                                                    <Button variant="secondary" size="sm" onClick={() => router.get(`/audit-sessions/${session.id}`)}>
                                                        <Eye size={14} className="mr-2" />
                                                        Detail
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
