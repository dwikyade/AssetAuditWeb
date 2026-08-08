import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { Search, Plus, Edit, Trash, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CategoryIndex({ categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/categories', { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const deleteCategory = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori ${name}?`)) {
            router.delete(`/categories/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Kategori" />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kategori Aset</h1>
                        <p className="text-sm text-gray-500">Kelola master data kategori untuk klasifikasi aset.</p>
                    </div>
                    <Button onClick={() => router.get('/categories/create')}>
                        <Plus size={16} className="mr-2" />
                        Tambah Kategori
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
                                placeholder="Cari kode atau nama kategori..."
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
                                            <td className="px-6 py-3 text-indigo-600 font-medium">
                                                <Link href={`/assets?category_id=${cat.id}`} className="hover:underline flex items-center gap-1">
                                                    {cat.assets_count} Aset <ChevronRight size={14} />
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => router.get(`/categories/${cat.id}/edit`)} title="Edit">
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
                                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
