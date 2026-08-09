import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, Package, Download } from 'lucide-react';
import { useState } from 'react';

export default function AssetRegister({ assets, filters, totals }) {
    const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

    return (
        <AppLayout>
            <Head title="Register Aset" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Register Aset</h1>
                            <p className="text-sm text-gray-500">Daftar lengkap aset hotel dan nilai buku saat ini.</p>
                        </div>
                    </div>
                    <form method="POST" action="/export/assets" className="inline-block">
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                            <Download size={16} className="mr-2" />
                            Ekspor ke Excel
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Aset</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totals.count.toLocaleString()} unit</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Total Nilai Perolehan</p>
                        <h3 className="text-2xl font-bold text-indigo-700 mt-1">{formatRp(totals.acquisition)}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-gray-500">Total Nilai Buku Saat Ini</p>
                        <h3 className="text-2xl font-bold text-emerald-700 mt-1">{formatRp(totals.book_value)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Aset</th>
                                    <th className="px-6 py-3 font-medium">Kategori</th>
                                    <th className="px-6 py-3 font-medium">Departemen / Lokasi</th>
                                    <th className="px-6 py-3 font-medium text-right">Nilai Perolehan</th>
                                    <th className="px-6 py-3 font-medium text-right">Nilai Buku</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{asset.asset_name}</div>
                                            <div className="text-xs text-indigo-600 font-mono mt-0.5">{asset.asset_code}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{asset.category?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{asset.department?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{asset.location?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700 font-mono">
                                            {formatRp(asset.acquisition_value)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 font-mono">
                                            {formatRp(asset.book_value)}
                                        </td>
                                    </tr>
                                ))}
                                {assets.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            Data aset kosong.
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
                                    onClick={() => link.url && router.get(link.url)}
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
