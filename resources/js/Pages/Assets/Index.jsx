import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input } from '@/Components/UI';
import { 
    Search, Plus, Filter, MoreVertical, Edit, 
    Trash, Eye, Download, FileSpreadsheet, QrCode
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AssetIndex({ assets, filters, categories, departments, locations, statuses, conditions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/assets', { ...filters, search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters]);

    const handleFilterChange = (key, value) => {
        router.get('/assets', { ...filters, [key]: value }, { preserveState: true });
    };

    const clearFilters = () => {
        router.get('/assets');
    };

    const deleteAsset = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus aset ${name}?`)) {
            router.delete(`/assets/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Aset" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
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
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Cari kode, nama aset..."
                                className="pl-10 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={Object.keys(filters).length > 1 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''}
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
                                <select 
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={filters.category_id || ''}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Departemen</label>
                                <select 
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={filters.department_id || ''}
                                    onChange={(e) => handleFilterChange('department_id', e.target.value)}
                                >
                                    <option value="">Semua Departemen</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Lokasi</label>
                                <select 
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={filters.location_id || ''}
                                    onChange={(e) => handleFilterChange('location_id', e.target.value)}
                                >
                                    <option value="">Semua Lokasi</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status & Kondisi</label>
                                <div className="flex gap-2">
                                    <select 
                                        className="w-1/2 rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={filters.status_id || ''}
                                        onChange={(e) => handleFilterChange('status_id', e.target.value)}
                                    >
                                        <option value="">Status</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <select 
                                        className="w-1/2 rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={filters.condition_id || ''}
                                        onChange={(e) => handleFilterChange('condition_id', e.target.value)}
                                    >
                                        <option value="">Kondisi</option>
                                        {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button variant="ghost" onClick={clearFilters} className="w-full text-gray-500">
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
                                    <th className="px-6 py-3 font-medium">Kode Aset</th>
                                    <th className="px-6 py-3 font-medium">Nama Aset</th>
                                    <th className="px-6 py-3 font-medium">Kategori / Dept</th>
                                    <th className="px-6 py-3 font-medium">Lokasi</th>
                                    <th className="px-6 py-3 font-medium">Status / Kondisi</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data aset yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    assets.data.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-indigo-600">{asset.asset_code}</div>
                                                <div className="text-xs text-gray-400">
                                                    Qty: {asset.quantity} {asset.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-gray-900">{asset.asset_name}</div>
                                                <div className="text-xs text-gray-500">{asset.brand} {asset.model}</div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="text-gray-900">{asset.category?.name || '-'}</div>
                                                <div className="text-xs text-gray-500">{asset.department?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-900">
                                                {asset.location?.name || '-'}
                                            </td>
                                            <td className="px-6 py-3">
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
                                                    <Button variant="ghost" size="icon" onClick={() => window.open(`/assets/${asset.id}/qr`, '_blank')} title="QR Code">
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
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
