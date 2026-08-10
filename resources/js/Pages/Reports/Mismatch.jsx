import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function MismatchReport({ audits, sessions, filters }) {
    const [sessionId, setSessionId] = useState(filters.session_id || '');

    const handleFilterChange = (e) => {
        const val = e.target.value;
        setSessionId(val);
        router.get('/reports/mismatch', { session_id: val }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Aset Mismatch" />
            
            <div className="p-6 md:p-8 w-full space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Aset Tidak Sesuai (Mismatch)</h1>
                            <p className="text-sm text-gray-500">Daftar aset dengan perbedaan lokasi atau kondisi saat audit fisik.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-sm font-medium">
                            <AlertTriangle size={16} />
                            Total Mismatch: {audits.total} Aset
                        </div>
                        <select 
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-gray-900 bg-white min-w-[250px]"
                            value={sessionId}
                            onChange={handleFilterChange}
                        >
                            <option value="">-- Semua Sesi Audit --</option>
                            {sessions.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Data Aset</th>
                                    <th className="px-6 py-3 font-medium">Kondisi & Lokasi (Sistem)</th>
                                    <th className="px-6 py-3 font-medium bg-amber-50">Kondisi & Lokasi (Temuan Fisik)</th>
                                    <th className="px-6 py-3 font-medium">Catatan Auditor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {audits.data.map((audit) => (
                                    <tr key={audit.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{audit.asset?.asset_name}</div>
                                            <div className="text-xs text-black font-mono mt-0.5">{audit.asset?.asset_code}</div>
                                            <div className="text-xs text-gray-500 mt-1">Sesi: {audit.audit_session?.code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900"><span className="text-gray-500 mr-1">Loc:</span>{audit.asset?.location?.name || '-'}</div>
                                            <div className="text-gray-900 mt-1"><span className="text-gray-500 mr-1">Cond:</span>{audit.asset?.condition?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 bg-amber-50/30">
                                            <div className={`font-medium ${audit.location_id !== audit.asset?.location_id ? 'text-amber-700 font-bold' : 'text-gray-900'}`}>
                                                <span className="text-amber-600/70 mr-1 font-normal">Loc:</span>{audit.location?.name || '-'}
                                            </div>
                                            <div className={`mt-1 font-medium ${audit.condition_id !== audit.asset?.condition_id ? 'text-amber-700 font-bold' : 'text-gray-900'}`}>
                                                <span className="text-amber-600/70 mr-1 font-normal">Cond:</span>{audit.condition?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={audit.notes}>
                                            {audit.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {audits.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data aset mismatch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {audits.links && audits.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-1 overflow-x-auto">
                            {audits.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => link.url && router.get(link.url, { session_id: sessionId }, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-black text-white font-medium' : link.url ? 'bg-white border hover:bg-gray-50 text-gray-700' : 'text-gray-400'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
