import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Select } from '@/Components/UI';
import {
    Search, Plus, Filter, MoreVertical, Edit,
    Trash, Eye, Download, FileSpreadsheet, QrCode,
    X, Printer, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssetIndex({ assets, filters, categories, departments, locations, statuses, conditions }) {
    const fmtNumber = (n) => new Intl.NumberFormat('id-ID').format(n ?? 0);
    const fmtCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n ?? 0);
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

    const [search, setSearch] = useState(filters.search || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [qrModal, setQrModal] = useState(false);
    const [qrAsset, setQrAsset] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

    const openQrModal = useCallback(async (asset) => {
        setQrAsset(asset);
        setQrData(null);
        setQrModal(true);
        setQrLoading(true);
        try {
            const res = await fetch(`/assets/${asset.id}/qr/json`, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            const data = await res.json();
            setQrData(data);
        } catch (e) {
            console.error('Failed to load QR', e);
        } finally {
            setQrLoading(false);
        }
    }, []);

    const handlePrint = () => {
        if (!qrData || !qrAsset) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>QR - ${qrAsset.asset_code}</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box}.container{text-align:center;border:1px solid #e5e7eb;border-radius:12px;padding:32px;max-width:320px}h1{font-size:1rem;font-weight:700;color:#111827;margin-bottom:4px}p{font-size:.75rem;color:#6b7280;margin:0 0 16px 0}.code{font-size:1.25rem;font-weight:800;color:#111827;font-family:monospace;margin-top:16px;letter-spacing:.05em}svg{max-width:100%}@media print{body{padding:0}}</style></head><body><div class="container"><h1>${qrAsset.asset_name}</h1><p>${qrAsset.category?.name ?? ''}</p>${qrData.qr_svg}<div class="code">${qrAsset.asset_code}</div></div><script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
        printWindow.document.close();
    };

    const handleDownload = () => {
        if (!qrData || !qrAsset) return;
        const blob = new Blob([qrData.qr_svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `qr-${qrAsset.asset_code}.svg`; a.click();
        URL.revokeObjectURL(url);
    };

    const handleRegenerate = async () => {
        if (!qrAsset) return;
        const ok = await window.confirmUI?.(`Regenerate QR Code untuk "${qrAsset.asset_code}"? QR lama tidak akan valid.`) ?? confirm('Regenerate QR Code?');
        if (!ok) return;
        router.post(`/assets/${qrAsset.id}/qr/regenerate`, {}, {
            onSuccess: () => openQrModal(qrAsset)
        });
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/assets', { ...filters, search }, { preserveState: true, replace: true });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleFilterChange = async (key, value) => {
        router.get('/assets', { ...filters, [key]: value }, { preserveState: true });
    };

    const clearFilters = async () => {
        router.get('/assets');
    };

    const deleteAsset = async (id, name) => {
        if (await window.confirmUI(`Apakah Anda yakin ingin menghapus aset ${name}?`)) {
            router.delete(`/assets/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Aset" />

            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Aset</h1>
                        <p className="text-sm text-gray-500">Kelola seluruh data aset, lokasi, dan kondisinya.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => window.location.href = '/export/assets'}>
                            <FileSpreadsheet size={16} className="mr-2" />
                            Export Excel
                        </Button>
                        <Button onClick={() => router.get('/assets/create')}>
                            <Plus size={16} className="mr-2" />
                            Tambah Aset
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-96">
                            <Input
                                type="text"
                                placeholder="Cari kode, nama aset..."
                                icon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={Object.keys(filters).length > 1 ? 'border-gray-900 text-black bg-gray-50' : ''}
                        >
                            <Filter size={16} className="mr-2" />
                            Filter
                        </Button>
                    </div>

                    {/* Filters Panel */}
                    {isFilterOpen && (
                        <div className="p-4 border-b border-gray-200 bg-white grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                                <Select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={filters.category_id || ''}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Departemen</label>
                                <Select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={filters.department_id || ''}
                                    onChange={(e) => handleFilterChange('department_id', e.target.value)}
                                >
                                    <option value="">Semua Departemen</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Lokasi</label>
                                <Select
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={filters.location_id || ''}
                                    onChange={(e) => handleFilterChange('location_id', e.target.value)}
                                >
                                    <option value="">Semua Lokasi</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status & Kondisi</label>
                                <div className="flex gap-2 w-full">
                                    <div className="flex-1 min-w-0">
                                        <Select
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            value={filters.status_id || ''}
                                            onChange={(e) => handleFilterChange('status_id', e.target.value)}
                                        >
                                            <option value="">Status</option>
                                            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </Select>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Select
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            value={filters.condition_id || ''}
                                            onChange={(e) => handleFilterChange('condition_id', e.target.value)}
                                        >
                                            <option value="">Kondisi</option>
                                            {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button variant="secondary" onClick={clearFilters} className="w-full">
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-center">No</th>
                                    <th className="px-4 py-3 font-medium">Kode</th>
                                    <th className="px-4 py-3 font-medium">Barang</th>
                                    <th className="px-4 py-3 font-medium">Lokasi</th>
                                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                                    <th className="px-4 py-3 font-medium text-center">Tgl. Oleh</th>
                                    <th className="px-4 py-3 font-medium text-center">Tgl Susut Akhir</th>
                                    <th className="px-4 py-3 font-medium text-right">Nilai Perolehan</th>
                                    <th className="px-4 py-3 font-medium text-right">Prev.Akum</th>
                                    <th className="px-4 py-3 font-medium text-right">Akum. Total</th>
                                    <th className="px-4 py-3 font-medium text-right">Nilai Per-Akum</th>
                                    <th className="px-4 py-3 font-medium text-right">Nilai Buku</th>
                                    <th className="px-4 py-3 font-medium">Status / Kondisi</th>
                                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="14" className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data aset yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    assets.data.map((asset, index) => (
                                        <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                             <td className="px-4 py-3 text-center text-gray-600">{assets.from + index}</td>
                                            <td className="px-4 py-3 font-mono font-medium text-gray-900">{asset.asset_code}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{asset.asset_name}</div>
                                                {(asset.category?.name || asset.department?.name) && (
                                                    <div className="text-xs text-gray-500">{asset.category?.name || '-'} · {asset.department?.name || '-'}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">{asset.location?.name || '-'}</td>
                                            <td className="px-4 py-3 text-right text-gray-900 tabular-nums">{fmtNumber(asset.quantity)} {asset.unit || ''}</td>
                                            <td className="px-4 py-3 text-center text-gray-700">{fmtDate(asset.acquisition_date)}</td>
                                            <td className="px-4 py-3 text-center text-gray-700">{fmtDate(asset.depreciation_end_date)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-gray-700">{fmtCurrency(asset.acquisition_value)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-gray-700">{fmtCurrency(asset.previous_accumulated_depreciation)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-gray-700">{fmtCurrency(asset.accumulated_depreciation)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-gray-700">{fmtCurrency(asset.depreciation_per_period)}</td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-gray-900">{fmtCurrency(asset.book_value)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium`} style={{ backgroundColor: `${asset.status?.color}20`, color: asset.status?.color || '#6b7280' }}>
                                                        {asset.status?.name || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium`} style={{ backgroundColor: `${asset.condition?.color}20`, color: asset.condition?.color || '#6b7280' }}>
                                                        {asset.condition?.name || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => router.get(`/assets/${asset.id}`)} title="Detail">
                                                        <Eye size={16} className="text-gray-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openQrModal(asset)} title="QR Code">
                                                        <QrCode size={16} className="text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => router.get(`/assets/${asset.id}/edit`)} title="Edit">
                                                        <Edit size={16} className="text-amber-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteAsset(asset.id, asset.asset_name)} title="Hapus">
                                                        <Trash size={16} className="text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {assets.links && assets.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Menampilkan <span className="font-medium">{assets.from}</span> sampai <span className="font-medium">{assets.to}</span> dari <span className="font-medium">{assets.total}</span> data
                            </div>
                            <div className="flex items-center gap-1">
                                {assets.links.map((link, i) => {
                                    if (link.url === null) {
                                        return (
                                            <div key={i} className="px-3 py-1 text-sm border border-gray-200 text-gray-400 rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {qrModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setQrModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 z-10 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <QrCode size={18} className="text-gray-700" />
                                    <h2 className="text-base font-bold text-gray-900">QR Code Aset</h2>
                                </div>
                                <button onClick={() => setQrModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="font-bold text-gray-900 text-base">{qrAsset?.asset_name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{qrAsset?.category?.name}{qrAsset?.category?.name && qrAsset?.location?.name ? ' · ' : ''}{qrAsset?.location?.name}</p>
                                </div>
                                <div className="bg-white border-2 border-gray-100 rounded-xl p-3 shadow-inner w-64 h-64 flex items-center justify-center">
                                    {qrLoading ? (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                            <span className="text-xs">Memuat QR...</span>
                                        </div>
                                    ) : qrData ? (
                                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: qrData.qr_svg }} />
                                    ) : (
                                        <div className="text-red-400 text-xs text-center">Gagal memuat QR Code</div>
                                    )}
                                </div>
                                <div className="font-mono font-bold text-lg tracking-widest text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-5 py-2">
                                    {qrAsset?.asset_code}
                                </div>
                            </div>
                            <div className="px-5 pb-5 grid grid-cols-3 gap-2">
                                <Button className="w-full text-xs" size="sm" onClick={handlePrint} disabled={!qrData}>
                                    <Printer size={13} className="mr-1.5" />Cetak
                                </Button>
                                <Button variant="secondary" className="w-full text-xs" size="sm" onClick={handleDownload} disabled={!qrData}>
                                    <Download size={13} className="mr-1.5" />Unduh
                                </Button>
                                <Button variant="danger" className="w-full text-xs" size="sm" onClick={handleRegenerate}>
                                    <RefreshCw size={13} className="mr-1.5" />Reset
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
