import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Select } from '@/Components/UI';
import {
    ArrowLeft, QrCode, Search, Filter, Printer,
    CheckSquare, Square, RotateCcw, Download, X, ArrowRight
} from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';

export default function QrExportPage({ assets, categories, departments, locations, statuses, conditions, filters }) {
    const [selected, setSelected] = useState(new Set());
    const [localSearch, setLocalSearch] = useState('');
    const [generating, setGenerating] = useState(false);
    const [qrItems, setQrItems] = useState(null);
    const [error, setError] = useState('');
    const MAX_SELECT = 100;

    // Filter assets client-side for quick search without page reload
    const visible = useMemo(() => {
        if (!localSearch.trim()) return assets;
        const q = localSearch.toLowerCase();
        return assets.filter(a =>
            a.asset_code?.toLowerCase().includes(q) ||
            a.asset_name?.toLowerCase().includes(q)
        );
    }, [assets, localSearch]);

    const allSelected = visible.length > 0 && visible.every(a => selected.has(a.id));

    const toggleAll = () => {
        if (allSelected) {
            setSelected(prev => {
                const next = new Set(prev);
                visible.forEach(a => next.delete(a.id));
                return next;
            });
        } else {
            setSelected(prev => {
                const next = new Set(prev);
                visible.forEach(a => next.add(a.id));
                return next;
            });
        }
    };

    const toggleOne = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const applyFilter = (key, value) => {
        router.get('/export/qr', { ...filters, [key]: value }, { preserveState: true });
    };

    const clearFilters = () => {
        setSelected(new Set());
        setQrItems(null);
        router.get('/export/qr');
    };

    const generateQr = useCallback(async () => {
        const ids = Array.from(selected);
        if (!ids.length) return;
        setGenerating(true);
        setError('');
        setQrItems(null);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/export/qr-bulk', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ ids: ids.slice(0, MAX_SELECT) }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${res.status}`);
            }
            const data = await res.json();
            setQrItems(data);
            setTimeout(() => document.getElementById('qr-preview')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (e) {
            setError(`Gagal generate QR code: ${e.message}`);
            console.error(e);
        } finally {
            setGenerating(false);
        }
    }, [selected]);

    const printQr = () => {
        if (!qrItems?.length) return;
        const rows = qrItems.map(item => `
            <div class="qr-card">
                <div class="qr-svg">${item.qr_svg}</div>
                <div class="code">${item.asset_code}</div>
                <div class="name">${item.asset_name}</div>
                ${item.location ? `<div class="sub">${item.category ? item.category + ' \u00b7 ' : ''}${item.location}</div>` : ''}
            </div>
        `).join('');

        const win = window.open('', '_blank');
        if (!win) {
            setError('Popup diblokir browser. Izinkan popup untuk mencetak QR code.');
            return;
        }
        win.document.write(`<!DOCTYPE html><html><head><title>QR Code - ${qrItems.length} Aset</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif;padding:16px}
h1{font-size:13px;font-weight:700;color:#111;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}
.qr-card{border:1px solid #e5e7eb;border-radius:8px;padding:10px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:5px;page-break-inside:avoid}
.qr-svg svg{width:90px;height:90px}.code{font-family:monospace;font-size:10px;font-weight:800;color:#111;letter-spacing:.04em;word-break:break-all}
.name{font-size:8.5px;color:#374151;font-weight:600;line-height:1.3}.sub{font-size:8px;color:#6b7280}
@media print{body{padding:8px}}</style></head>
<body><h1>QR Code Aset \u2014 ${qrItems.length} aset</h1>
<div class="grid">${rows}</div>
<script>window.onload=()=>{window.print()}<\/script></body></html>`);
        win.document.close();
    };

    const downloadAll = () => {
        if (!qrItems?.length) return;
        qrItems.forEach((item, i) => {
            setTimeout(() => {
                const blob = new Blob([item.qr_svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `qr-${item.asset_code}.svg`; a.click();
                URL.revokeObjectURL(url);
            }, i * 80);
        });
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <AppLayout>
            <Head title="Export QR Code Massal" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.visit('/export')}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <QrCode size={22} />
                                Export QR Code Massal
                            </h1>
                            <p className="text-sm text-gray-500">Filter dan pilih aset, lalu cetak atau unduh QR code sekaligus.</p>
                        </div>
                    </div>
                    {qrItems && (
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" onClick={downloadAll}>
                                <Download size={16} className="mr-2" /> Unduh SVG
                            </Button>
                            <Button onClick={printQr}>
                                <Printer size={16} className="mr-2" /> Cetak QR
                            </Button>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                        <X size={16} className="mt-0.5 shrink-0" /> {error}
                    </div>
                )}

                {/* Filter Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <Filter size={15} />
                            Filter Aset
                            {activeFilterCount > 0 && (
                                <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                            )}
                        </h2>
                        {activeFilterCount > 0 && (
                            <Button variant="secondary" size="sm" onClick={clearFilters}>
                                <RotateCcw size={13} className="mr-1.5" /> Reset Filter
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                            <Select value={filters.category_id || ''} onChange={e => applyFilter('category_id', e.target.value)}>
                                <option value="">Semua Kategori</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Departemen</label>
                            <Select value={filters.department_id || ''} onChange={e => applyFilter('department_id', e.target.value)}>
                                <option value="">Semua Departemen</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi</label>
                            <Select value={filters.location_id || ''} onChange={e => applyFilter('location_id', e.target.value)}>
                                <option value="">Semua Lokasi</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <Select value={filters.status_id || ''} onChange={e => applyFilter('status_id', e.target.value)}>
                                <option value="">Semua Status</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Kondisi</label>
                            <Select value={filters.condition_id || ''} onChange={e => applyFilter('condition_id', e.target.value)}>
                                <option value="">Semua Kondisi</option>
                                {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Asset Selection Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={toggleAll}
                                className="text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0"
                                title={allSelected ? 'Batal pilih semua' : 'Pilih semua'}
                            >
                                {allSelected
                                    ? <CheckSquare size={20} className="text-gray-900" />
                                    : <Square size={20} />
                                }
                            </button>
                            <Input
                                icon={Search}
                                placeholder="Cari kode atau nama aset..."
                                value={localSearch}
                                onChange={e => setLocalSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {selected.size > 0 && (
                                <>
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                        {selected.size} dipilih
                                        {selected.size > MAX_SELECT && (
                                            <span className="ml-1 text-amber-600 font-normal">(maks {MAX_SELECT} akan di-generate)</span>
                                        )}
                                    </span>
                                    <Button onClick={generateQr} disabled={generating}>
                                        {generating
                                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />Generating...</>
                                            : <><QrCode size={16} className="mr-2" />Generate QR ({Math.min(selected.size, MAX_SELECT)})</>
                                        }
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 w-10"></th>
                                    <th className="px-4 py-3">Kode Aset</th>
                                    <th className="px-4 py-3">Nama Aset</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Lokasi</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visible.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            Tidak ada aset ditemukan dengan filter ini
                                        </td>
                                    </tr>
                                ) : visible.map(asset => (
                                    <tr
                                        key={asset.id}
                                        className={`cursor-pointer transition-colors ${selected.has(asset.id) ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                        onClick={() => toggleOne(asset.id)}
                                    >
                                        <td className="px-4 py-3">
                                            {selected.has(asset.id)
                                                ? <CheckSquare size={18} className="text-gray-900" />
                                                : <Square size={18} className="text-gray-300" />
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs">
                                                {asset.asset_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{asset.asset_name}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{asset.category?.name || '-'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{asset.location?.name || '-'}</td>
                                        <td className="px-4 py-3">
                                            {asset.status && (
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: `${asset.status.color}20`, color: asset.status.color }}
                                                >
                                                    {asset.status.name}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <span>Menampilkan <strong className="text-gray-700">{visible.length}</strong> dari <strong className="text-gray-700">{assets.length}</strong> aset</span>
                        {selected.size > 0 && (
                            <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                <X size={12} /> Batalkan pilihan
                            </button>
                        )}
                    </div>
                </div>

                {/* QR Preview Grid */}
                {qrItems && (
                    <div id="qr-preview" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <QrCode size={18} />
                                Preview QR Code
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">{qrItems.length} aset</span>
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={downloadAll}>
                                    <Download size={14} className="mr-1.5" /> Unduh Semua
                                </Button>
                                <Button size="sm" onClick={printQr}>
                                    <Printer size={14} className="mr-1.5" /> Cetak
                                </Button>
                            </div>
                        </div>
                        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {qrItems.map(item => (
                                <div key={item.id} className="flex h-full min-h-[210px] flex-col items-center justify-start border border-gray-200 rounded-xl bg-white p-3 gap-2 hover:shadow-md transition-shadow">
                                    <div className="flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100 p-2 [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full [&_svg]:max-w-full">
                                        <div
                                            className="h-full w-full"
                                            dangerouslySetInnerHTML={{ __html: item.qr_svg }}
                                        />
                                    </div>
                                    <span className="font-mono font-bold text-gray-900 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-xs text-center w-full truncate">
                                        {item.asset_code}
                                    </span>
                                    <p className="min-h-[32px] text-xs text-gray-700 text-center leading-tight line-clamp-2 font-medium w-full">{item.asset_name}</p>
                                    {item.location && <p className="text-xs text-gray-400 text-center truncate w-full">{item.location}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
