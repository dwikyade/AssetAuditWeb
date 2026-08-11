import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label, Modal } from '@/Components/UI';
import { Search, Plus, Edit, Trash, ChevronRight, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

function CategoryForm({ isOpen, onClose, initialData = null }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        description: '',
        depreciation_months: 60,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setData({
                    code: initialData.code || '',
                    name: initialData.name || '',
                    description: initialData.description || '',
                    depreciation_months: initialData.depreciation_months || 60,
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
            put(`/categories/${initialData.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/categories', {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={initialData ? 'Edit Kategori' : 'Tambah Kategori'}
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="code">Kode Kategori *</Label>
                    <Input
                        id="code"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        error={errors.code}
                        placeholder="Contoh: ELK"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Kode unik untuk identifikasi, maksimal 30 karakter.</p>
                </div>
                
                <div>
                    <Label htmlFor="name">Nama Kategori *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Contoh: Elektronik"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="depreciation_months">Usia Penyusutan (Bulan) *</Label>
                    <Input
                        id="depreciation_months"
                        type="number"
                        min="1"
                        value={data.depreciation_months}
                        onChange={(e) => setData('depreciation_months', e.target.value)}
                        error={errors.depreciation_months}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Estimasi masa pakai ekonomis aset (contoh: 5 tahun = 60 bulan).</p>
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className={`flex w-full rounded-sm border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 min-h-[80px] transition-colors`}
                        placeholder="Penjelasan singkat mengenai kategori ini..."
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description}</p>}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
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

export default function CategoryIndex({ categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/categories', { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const openCreateModal = async () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (cat) => {
        setEditData(cat);
        setIsModalOpen(true);
    };

    const deleteCategory = async (id, name) => {
        if (await window.confirmUI(`Apakah Anda yakin ingin menghapus kategori ${name}?`)) {
            router.delete(`/categories/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Kategori" />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kategori Aset</h1>
                        <p className="text-sm text-gray-500">Kelola master data kategori untuk klasifikasi aset.</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus size={16} className="mr-2" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="w-full max-w-md">
                            <Input
                                type="text"
                                placeholder="Cari kode atau nama kategori..."
                                icon={Search}
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
                                    <th className="px-6 py-3 font-medium">Nama Kategori</th>
                                    <th className="px-6 py-3 font-medium">Deskripsi</th>
                                    <th className="px-6 py-3 font-medium">Usia Susut (Bulan)</th>
                                    <th className="px-6 py-3 font-medium">Jumlah Aset</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data kategori yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900">{cat.code}</td>
                                            <td className="px-6 py-3 text-gray-900">{cat.name}</td>
                                            <td className="px-6 py-3 text-gray-500 truncate max-w-xs">{cat.description || '-'}</td>
                                            <td className="px-6 py-3 text-gray-900">{cat.depreciation_months}</td>
                                            <td className="px-6 py-3 text-black font-medium">
                                                <Link href={`/assets?category_id=${cat.id}`} className="hover:underline flex items-center gap-1">
                                                    {cat.assets_count} Aset <ChevronRight size={14} />
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(cat)} title="Edit">
                                                        <Edit size={16} className="text-amber-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id, cat.name)} title="Hapus">
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
                    
                    {categories.links && categories.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-1 justify-end">
                            {categories.links.map((link, i) => {
                                if (link.url === null) {
                                    return <div key={i} className="px-3 py-1 text-sm border border-gray-200 text-gray-400 rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: link.label }} />;
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
                    )}
                </div>
            </div>

            <CategoryForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialData={editData} 
            />
        </AppLayout>
    );
}
