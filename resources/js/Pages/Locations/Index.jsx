import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label, Modal } from '@/Components/UI';
import { Search, Plus, Edit, Trash, MapPin, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

function LocationForm({ isOpen, onClose, initialData = null, parents = [] }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        parent_id: '',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setData({
                    code: initialData.code || '',
                    name: initialData.name || '',
                    parent_id: initialData.parent_id || '',
                    description: initialData.description || '',
                    is_active: initialData.is_active ?? true,
                });
            } else {
                reset();
            }
            clearErrors();
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (initialData) {
            put(`/locations/${initialData.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/locations', {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={initialData ? 'Edit Lokasi' : 'Tambah Lokasi'}
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="code">Kode Lokasi *</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={e => setData('code', e.target.value.toUpperCase())}
                            placeholder="contoh: LBY-01"
                            className="uppercase"
                            error={errors.code}
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Nama Lokasi *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="contoh: Lobby Utama"
                            error={errors.name}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="parent_id">Lokasi Induk (opsional)</Label>
                    <select
                        id="parent_id"
                        value={data.parent_id}
                        onChange={e => setData('parent_id', e.target.value)}
                        className={`mt-1 w-full rounded-sm border ${errors.parent_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors`}
                    >
                        <option value="">-- Tidak ada (Lokasi Utama) --</option>
                        {parents.map(p => (
                            <option key={p.id} value={p.id} disabled={initialData?.id === p.id}>
                                {p.name} ({p.code})
                            </option>
                        ))}
                    </select>
                    {errors.parent_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.parent_id}</p>}
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <textarea
                        id="description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        placeholder="Deskripsi lokasi ini..."
                        className={`mt-1 w-full rounded-sm border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 min-h-[80px] transition-colors resize-none`}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-900"
                    />
                    <Label htmlFor="is_active" className="cursor-pointer mb-0">Lokasi Aktif</Label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" isLoading={processing}>
                        {!processing && <Save size={16} className="mr-2" />}
                        Simpan
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default function LocationsIndex({ locations, filters, parents }) {
    const [search, setSearch] = useState(filters.search || '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/locations', { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const openCreateModal = async () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (loc) => {
        setEditData(loc);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (await window.confirmUI(`Hapus lokasi "${name}"? Hanya lokasi tanpa aset & sub-lokasi yang bisa dihapus.`)) {
            router.delete(`/locations/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Lokasi" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lokasi</h1>
                        <p className="text-sm text-gray-500">Kelola master data lokasi / area di hotel.</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus size={16} className="mr-2" /> Tambah Lokasi
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Cari kode atau nama lokasi..."
                                className="pl-10 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Kode</th>
                                    <th className="px-6 py-3 font-medium">Nama Lokasi</th>
                                    <th className="px-6 py-3 font-medium">Lokasi Induk</th>
                                    <th className="px-6 py-3 font-medium text-center">Jumlah Aset</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {locations.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <MapPin size={40} className="mx-auto mb-2 opacity-20" />
                                            Tidak ada data lokasi yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    locations.data.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-mono text-gray-900 font-medium">{loc.code}</td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{loc.name}</td>
                                            <td className="px-6 py-3 text-gray-500">{loc.parent?.name || <span className="italic text-gray-400">-</span>}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                                                    {loc.assets_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${loc.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                    {loc.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(loc)} title="Edit">
                                                        <Edit size={16} className="text-amber-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id, loc.name)} title="Hapus">
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

                    {locations.links && locations.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-1 justify-end">
                            {locations.links.map((link, i) => (
                                link.url === null
                                    ? <div key={i} className="px-3 py-1 text-sm border border-gray-200 text-gray-400 rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <Link key={i} href={link.url} className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <LocationForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialData={editData}
                parents={parents}
            />
        </AppLayout>
    );
}
