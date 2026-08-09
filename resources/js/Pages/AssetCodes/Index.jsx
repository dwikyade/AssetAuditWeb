import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input } from '@/Components/UI';
import { Search, Plus, Edit, Hash, Eye, PowerOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AssetCodesIndex({ prefixes, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [previews, setPreviews] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/asset-code-prefixes', { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handlePreview = async (prefix) => {
        if (previews[prefix.id]) {
            setPreviews(prev => { const p = {...prev}; delete p[prefix.id]; return p; });
            return;
        }
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/asset-code-prefixes/${prefix.id}/preview`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            setPreviews(prev => ({ ...prev, [prefix.id]: data.code || data.error || '—' }));
        } catch {
            setPreviews(prev => ({ ...prev, [prefix.id]: 'Error' }));
        }
    };

    const handleDeactivate = (id, name) => {
        if (confirm(`Nonaktifkan prefix "${name}"? Prefix tidak dapat dihapus, hanya dinonaktifkan.`)) {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            fetch(`/asset-code-prefixes/${id}/deactivate`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf },
            }).then(() => router.reload());
        }
    };

    return (
        <AppLayout>
            <Head title="Kode Aset (Prefix)" />
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kode Aset (Prefix)</h1>
                        <p className="text-sm text-gray-500">Kelola format penomoran kode aset otomatis.</p>
                    </div>
                    <Button onClick={() => router.get('/asset-code-prefixes/create')}>
                        <Plus size={16} className="mr-2" /> Tambah Prefix
                    </Button>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
                    <strong>Cara kerja:</strong> Setiap prefix mendefinisikan format kode aset. Contoh format: <code className="bg-indigo-100 px-1 rounded font-mono">HA-{'{'} PREFIX{'}'}-{'{'} NUMBER{'}'}</code> dengan prefix <code className="bg-indigo-100 px-1 rounded font-mono">FF</code> dan panjang angka 4 akan menghasilkan kode <code className="bg-indigo-100 px-1 rounded font-mono">HA-FF-0001</code>.
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Cari prefix atau nama..."
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
                                    <th className="px-6 py-3 font-medium">Prefix</th>
                                    <th className="px-6 py-3 font-medium">Nama / Format</th>
                                    <th className="px-6 py-3 font-medium text-center">Nomor Berikutnya</th>
                                    <th className="px-6 py-3 font-medium text-center">Preview Kode</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {prefixes.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <Hash size={40} className="mx-auto mb-2 opacity-20" />
                                            Belum ada prefix kode aset yang dibuat.
                                        </td>
                                    </tr>
                                ) : (
                                    prefixes.data.map((prefix) => (
                                        <tr key={prefix.id} className={`transition-colors ${prefix.is_active ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                        {prefix.prefix.substring(0, 3)}
                                                    </div>
                                                    <span className="font-mono font-bold text-indigo-700">{prefix.prefix}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-gray-900">{prefix.name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{prefix.format}</div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="font-mono font-bold text-gray-700">
                                                    {String(prefix.next_number).padStart(prefix.number_length, '0')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                {previews[prefix.id] ? (
                                                    <code className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono text-xs">
                                                        {previews[prefix.id]}
                                                    </code>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handlePreview(prefix)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <Eye size={14} className="mr-1" /> Lihat
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prefix.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {prefix.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.get(`/asset-code-prefixes/${prefix.id}/edit`)}
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} className="text-amber-500" />
                                                    </Button>
                                                    {prefix.is_active && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeactivate(prefix.id, prefix.prefix)}
                                                            title="Nonaktifkan"
                                                        >
                                                            <PowerOff size={16} className="text-red-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {prefixes.links && prefixes.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-1 justify-end">
                            {prefixes.links.map((link, i) => (
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
