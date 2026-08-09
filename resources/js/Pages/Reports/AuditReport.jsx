import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function AuditReport({ sessions }) {
    
    const getStatusBadge = (status) => {
        const map = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
            scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dijadwalkan' },
            in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Sedang Berjalan' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dibatalkan' }
        };
        const s = map[status] || map.draft;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    return (
        <AppLayout>
            <Head title="Laporan Hasil Audit" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laporan Hasil Audit</h1>
                            <p className="text-sm text-gray-500">Rekapitulasi riwayat pelaksanaan audit / stock opname aset.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Sesi Audit</th>
                                    <th className="px-6 py-3 font-medium">Pembuat</th>
                                    <th className="px-6 py-3 font-medium">Status & Waktu</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi Ekspor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sessions.data.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{session.name}</div>
                                            <div className="text-xs text-indigo-600 font-mono mt-0.5">{session.code}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{session.creator?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="mb-1">{getStatusBadge(session.status)}</div>
                                            {session.status === 'completed' && (
                                                <div className="text-xs text-gray-500">
                                                    Selesai: {new Date(session.completed_at).toLocaleDateString('id-ID')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form method="POST" action="/export/audit" className="inline-block">
                                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                                                <input type="hidden" name="session_id" value={session.id} />
                                                <Button type="submit" variant="secondary" size="sm" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                                                    <Download size={14} className="mr-2" />
                                                    Unduh Rekap Audit
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {sessions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            Belum ada data riwayat audit.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
