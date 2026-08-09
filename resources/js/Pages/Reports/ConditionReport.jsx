import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, FileText } from 'lucide-react';
import { useState } from 'react';

export default function ConditionReport({ by_condition, assets, filters }) {
    const [conditionId, setConditionId] = useState(filters.condition_id || '');

    const handleFilterChange = (e) => {
        const val = e.target.value;
        setConditionId(val);
        router.get('/reports/condition', { condition_id: val }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Laporan Kondisi Aset" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laporan Kondisi Aset</h1>
                            <p className="text-sm text-gray-500">Pemetaan jumlah aset berdasarkan status kondisi fisiknya.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {by_condition.map((c, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                                <span className="text-sm font-medium text-gray-700">{c.name}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{c.count} <span className="text-sm font-normal text-gray-500">unit</span></h3>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={18} className="text-gray-400" />
                            Daftar Aset
                        </h3>
                        <select 
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-indigo-500 bg-white min-w-[200px]"
                            value={conditionId}
                            onChange={handleFilterChange}
                        >
                            <option value="">-- Semua Kondisi --</option>
                            {by_condition.map(c => (
                                <option key={c.name} value={c.id || c.name}>{c.name}</option> // using name as fallback if id is not available in raw query
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Aset</th>
                                    <th className="px-6 py-3 font-medium">Kategori</th>
                                    <th className="px-6 py-3 font-medium">Lokasi</th>
                                    <th className="px-6 py-3 font-medium text-right">Kondisi Fisik</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{asset.asset_name}</div>
                                            <div className="text-xs text-indigo-600 font-mono mt-0.5">{asset.asset_code}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{asset.category?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-700">{asset.location?.name || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {asset.condition ? (
                                                <span 
                                                    className="px-2 py-1 rounded-full text-xs font-medium border"
                                                    style={{ 
                                                        backgroundColor: asset.condition.color ? `${asset.condition.color}15` : '#f3f4f6', 
                                                        color: asset.condition.color || '#4b5563',
                                                        borderColor: asset.condition.color ? `${asset.condition.color}30` : '#e5e7eb'
                                                    }}
                                                >
                                                    {asset.condition.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Belum diset</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {assets.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada aset yang sesuai kriteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {assets.links && assets.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-1 overflow-x-auto">
                            {assets.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => link.url && router.get(link.url, { condition_id: conditionId }, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white font-medium' : link.url ? 'bg-white border hover:bg-gray-50 text-gray-700' : 'text-gray-400'}`}
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
