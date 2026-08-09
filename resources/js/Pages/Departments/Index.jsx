import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input } from '@/Components/UI';
import { Search, Plus, Edit, Trash, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DepartmentsIndex({ departments, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/departments', { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleDelete = (id, name) => {
        if (confirm(`Hapus departemen "${name}"? Hanya departemen tanpa aset yang bisa dihapus.`)) {
            router.delete(`/departments/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Departemen" />
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Departemen</h1>
                        <p className="text-sm text-gray-500">Kelola master data departemen hotel.</p>
                    </div>
                    <Button onClick={() => router.get('/departments/create')}>
                        <Plus size={16} className="mr-2" /> Tambah Departemen
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
                                placeholder="Cari kode atau nama departemen..."
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
                                    <th className="px-6 py-3 font-medium">Nama Departemen</th>
                                    <th className="px-6 py-3 font-medium">Deskripsi</th>
                                    <th className="px-6 py-3 font-medium text-center">Jumlah Aset</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {departments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <Building2 size={40} className="mx-auto mb-2 opacity-20" />
                                            Tidak ada data departemen yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    departments.data.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-mono text-indigo-700 font-medium">{dept.code}</td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{dept.name}</td>
                                            <td className="px-6 py-3 text-gray-500 max-w-xs truncate">{dept.description || '-'}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-100">
                                                    {dept.assets_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dept.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {dept.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => router.get(`/departments/${dept.id}/edit`)} title="Edit">
                                                        <Edit size={16} className="text-amber-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id, dept.name)} title="Hapus">
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

                    {departments.links && departments.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-1 justify-end">
                            {departments.links.map((link, i) => (
                                link.url === null
                                    ? <div key={i} className="px-3 py-1 text-sm border border-gray-200 text-gray-400 rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <Link key={i} href={link.url} className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
