import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input } from '@/Components/UI';
import { Search, Filter, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const actionColors = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    login: 'bg-gray-100 text-gray-900',
    logout: 'bg-gray-100 text-gray-700',
    import: 'bg-amber-100 text-amber-700',
    export: 'bg-cyan-100 text-cyan-700',
};

export default function ActivityLogsIndex({ logs, filters, modules }) {
    const [search, setSearch] = useState(filters.search || '');
    const [module, setModule] = useState(filters.module || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/activity-logs', { search, module, date_from: dateFrom, date_to: dateTo }, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, module, dateFrom, dateTo]);

    const formatTime = (dt) => {
        const d = new Date(dt);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout>
            <Head title="Activity Log" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                        <p className="text-sm text-gray-500">Riwayat lengkap aktivitas seluruh pengguna di sistem.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>Total: {logs.total} entri</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                        <Filter size={16} className="text-gray-400" />
                        Filter Log
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={14} className="text-gray-400" />
                            </div>
                            <Input type="text" placeholder="Cari deskripsi..." className="pl-8 text-sm h-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white h-9"
                            value={module}
                            onChange={e => setModule(e.target.value)}
                        >
                            <option value="">Semua Modul</option>
                            {modules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <Input type="date" className="text-sm h-9" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Dari tanggal" />
                        <Input type="date" className="text-sm h-9" value={dateTo} onChange={e => setDateTo(e.target.value)} title="Sampai tanggal" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium whitespace-nowrap">Waktu</th>
                                    <th className="px-6 py-3 font-medium whitespace-nowrap">Pengguna</th>
                                    <th className="px-6 py-3 font-medium whitespace-nowrap">Aksi & Modul</th>
                                    <th className="px-6 py-3 font-medium">Deskripsi</th>
                                    <th className="px-6 py-3 font-medium whitespace-nowrap">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                                            {formatTime(log.created_at)}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                                                    {log.action}
                                                </span>
                                                <span className="text-xs text-gray-500">{log.module}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-700 max-w-xs truncate" title={log.description || '-'}>
                                            {log.description || '-'}
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                                            {log.ip_address || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <Clock size={40} className="mx-auto mb-2 opacity-20" />
                                            Tidak ada log aktivitas yang sesuai filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.links && logs.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-1 justify-end">
                            {logs.links.map((link, i) => (
                                link.url === null
                                    ? <div key={i} className="px-3 py-1 text-sm border border-gray-200 text-gray-400 rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <button key={i} onClick={() => router.get(link.url)} className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
