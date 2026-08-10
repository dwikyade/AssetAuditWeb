import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { Play, StopCircle, ArrowLeft, XCircle, CheckCircle, Clock } from 'lucide-react';

export default function AuditSessionShow({ session, stats }) {
    
    const startSession = async () => {
        if (await window.confirmUI('Mulai sesi audit ini sekarang?')) {
            router.post(`/audit-sessions/${session.id}/start`);
        }
    };
    
    const completeSession = async () => {
        if (await window.confirmUI('Selesaikan sesi audit? Pastikan semua aset sudah diperiksa.')) {
            router.post(`/audit-sessions/${session.id}/complete`);
        }
    };

    const cancelSession = async () => {
        if (await window.confirmUI('Yakin ingin membatalkan sesi audit ini?')) {
            router.post(`/audit-sessions/${session.id}/cancel`);
        }
    };

    return (
        <AppLayout>
            <Head title={`Sesi Audit: ${session.name}`} />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/audit-sessions'}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
                            <p className="text-sm text-gray-500">Kode Sesi: {session.code} | Dibuat oleh: {session.creator?.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {session.status === 'draft' || session.status === 'scheduled' ? (
                            <Button onClick={startSession}>
                                <Play size={16} className="mr-2" />
                                Mulai Audit
                            </Button>
                        ) : session.status === 'in_progress' ? (
                            <>
                                <Button onClick={() => router.get(`/audit-sessions/${session.id}/conduct`)}>
                                    <Play size={16} className="mr-2" />
                                    Lanjutkan Audit (Conduct)
                                </Button>
                                <Button variant="secondary" onClick={completeSession} className="text-green-600 border-green-200 hover:bg-green-50">
                                    <CheckCircle size={16} className="mr-2" />
                                    Selesai
                                </Button>
                                <Button variant="ghost" onClick={cancelSession} className="text-red-600 hover:bg-red-50">
                                    Batalkan
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ringkasan & Info */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Informasi Sesi</h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500">Status</dt>
                                    <dd className="font-medium capitalize text-black">{session.status.replace('_', ' ')}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Mode Penyelesaian</dt>
                                    <dd className="font-medium capitalize">{session.completion_mode}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Tipe Scope (Cakupan)</dt>
                                    <dd className="font-medium capitalize">{session.scope_type}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Jadwal Mulai</dt>
                                    <dd className="font-medium">{session.start_date || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Jadwal Selesai</dt>
                                    <dd className="font-medium">{session.end_date || '-'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                    
                    {/* Statistik & Progres */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Progres Audit</h3>
                            
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Telah Diaudit: {stats.audited} dari {stats.total_scope} Aset</span>
                                <span className="text-sm font-bold text-black">{stats.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                                <div className="bg-black h-3 rounded-full" style={{ width: `${stats.progress}%` }}></div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Total Target</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_scope}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                                    <p className="text-xs text-green-700 font-medium mb-1">Ditemukan</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.found}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                                    <p className="text-xs text-red-700 font-medium mb-1">Tidak Ditemukan</p>
                                    <p className="text-2xl font-bold text-red-700">{stats.not_found}</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-center">
                                    <p className="text-xs text-amber-700 font-medium mb-1">Beda Data / Mismatch</p>
                                    <p className="text-2xl font-bold text-amber-700">{stats.mismatches}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* List of Audited Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-gray-900">Histori Audit Terakhir</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Aset</th>
                                            <th className="px-4 py-3 font-medium">Auditor</th>
                                            <th className="px-4 py-3 font-medium">Waktu</th>
                                            <th className="px-4 py-3 font-medium">Status Fisik</th>
                                            <th className="px-4 py-3 font-medium">Hasil Sistem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {session.audits && session.audits.length > 0 ? (
                                            session.audits.map(audit => (
                                                <tr key={audit.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900">{audit.asset?.asset_name}</div>
                                                        <div className="text-xs text-black font-mono">{audit.asset?.asset_code}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{audit.auditor?.name}</td>
                                                    <td className="px-4 py-3 text-gray-500">{new Date(audit.audit_time).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 capitalize">
                                                        {audit.found_status === 'found' ? <span className="text-green-600 font-medium">Ditemukan</span> : 
                                                         audit.found_status === 'not_found' ? <span className="text-red-600 font-medium">Hilang</span> : 
                                                         <span className="text-amber-600 font-medium">Sebagian</span>}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium uppercase">
                                                        {audit.result === 'match' ? <span className="text-green-600">Match</span> : 
                                                         audit.result === 'mismatch' ? <span className="text-amber-600">Mismatch</span> : 
                                                         <span className="text-red-600">Issue</span>}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                                    Belum ada aset yang diaudit pada sesi ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
