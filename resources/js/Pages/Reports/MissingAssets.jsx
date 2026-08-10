import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, FileWarning, AlertCircle } from 'lucide-react';

export default function MissingAssets({ missing_assets, session }) {
    const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

    return (
        <AppLayout>
            <Head title="Aset Hilang" />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => window.location.href = '/reports'}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Aset Hilang (Missing)</h1>
                        <p className="text-sm text-gray-500">Aset yang tercatat di sistem namun tidak ditemukan pada audit terakhir.</p>
                    </div>
                </div>

                {!session ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-start gap-4">
                        <AlertCircle className="shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-lg">Belum Ada Data Audit Selesai</h3>
                            <p className="mt-1">Laporan aset hilang baru dapat digenerate setelah ada minimal 1 sesi audit (Stock Opname) yang diselesaikan (Completed).</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Berdasarkan Sesi Audit Terakhir:</p>
                                <p className="font-bold text-gray-900 mt-1">{session.name} <span className="text-black font-mono font-normal">({session.code})</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-medium">Total Aset Tidak Ditemukan</p>
                                <p className="font-bold text-red-600 text-2xl mt-1">{missing_assets.total} unit</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-red-50/50 flex gap-2 text-red-800 text-sm">
                                <FileWarning size={18} />
                                <span>Aset-aset di bawah ini memerlukan investigasi lebih lanjut karena tidak dapat ditemukan secara fisik.</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Data Aset</th>
                                            <th className="px-6 py-3 font-medium">Kategori</th>
                                            <th className="px-6 py-3 font-medium">Lokasi Tercatat Terakhir</th>
                                            <th className="px-6 py-3 font-medium text-right">Potensi Kerugian (Nilai Buku)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {missing_assets.data.map((asset) => (
                                            <tr key={asset.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{asset.asset_name}</div>
                                                    <div className="text-xs text-red-600 font-mono mt-0.5">{asset.asset_code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{asset.category?.name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 font-medium">{asset.location?.name || '-'}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">Dept: {asset.department?.name || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-medium text-red-700">
                                                    {formatRp(asset.book_value)}
                                                </td>
                                            </tr>
                                        ))}
                                        {missing_assets.data.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                        <p className="font-medium text-gray-900">Luar biasa!</p>
                                                        <p className="text-sm">Tidak ada aset yang hilang pada audit terakhir.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {missing_assets.links && missing_assets.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-1 overflow-x-auto">
                                    {missing_assets.links.map((link, k) => (
                                        <button
                                            key={k}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-black text-white font-medium' : link.url ? 'bg-white border hover:bg-gray-50 text-gray-700' : 'text-gray-400'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
