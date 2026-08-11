import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label, Modal } from '@/Components/UI';
import { Search, Plus, Edit, Hash, Eye, PowerOff, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

function AssetCodePrefixForm({ isOpen, onClose, initialData = null }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        prefix: '',
        name: '',
        description: '',
        format: '{PREFIX}-{NUMBER}',
        number_length: 4,
        next_number: 1,
        is_active: true,
    });

    const [previewCode, setPreviewCode] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setData({
                    prefix: initialData.prefix || '',
                    name: initialData.name || '',
                    description: initialData.description || '',
                    format: initialData.format || '{PREFIX}-{NUMBER}',
                    number_length: initialData.number_length || 4,
                    next_number: initialData.next_number || 1,
                    is_active: initialData.is_active ?? true,
                });
            } else {
                reset();
                setPreviewCode('');
            }
            clearErrors();
        }
    }, [isOpen, initialData]);

    const generatePreview = async () => {
        if (!data.prefix || !data.format) return;
        const number = String(data.next_number || 1).padStart(data.number_length || 4, '0');
        const code = data.format
            .replace('{PREFIX}', data.prefix.toUpperCase())
            .replace('{NUMBER}', number);
        setPreviewCode(code);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (initialData) {
            put(`/asset-code-prefixes/${initialData.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/asset-code-prefixes', {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Prefix Kode Aset' : 'Tambah Prefix Kode Aset'}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="prefix">Prefix *</Label>
                        <Input
                            id="prefix"
                            value={data.prefix}
                            onChange={e => setData('prefix', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                            placeholder="contoh: FF, KIT, LBY"
                            className="uppercase font-mono"
                            maxLength={20}
                            error={errors.prefix}
                        />
                        <p className="text-xs text-gray-400 mt-1">Singkatan unik kategori/departemen.</p>
                    </div>
                    <div>
                        <Label htmlFor="name">Nama Prefix *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="contoh: Front Office"
                            error={errors.name}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="format">Format Kode *</Label>
                    <Input
                        id="format"
                        value={data.format}
                        onChange={e => setData('format', e.target.value)}
                        placeholder="contoh: HA-{PREFIX}-{NUMBER}"
                        className="font-mono"
                        error={errors.format}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Gunakan <code className="bg-gray-100 px-1 rounded">{'{' + 'PREFIX' + '}'}</code> dan <code className="bg-gray-100 px-1 rounded">{'{' + 'NUMBER' + '}'}</code>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="number_length">Panjang Digit Nomor *</Label>
                        <Input
                            id="number_length"
                            type="number"
                            min={1}
                            max={10}
                            value={data.number_length}
                            onChange={e => setData('number_length', parseInt(e.target.value) || 4)}
                            error={errors.number_length}
                        />
                    </div>
                    <div>
                        <Label htmlFor="next_number">Nomor Selanjutnya *</Label>
                        <Input
                            id="next_number"
                            type="number"
                            min={1}
                            value={data.next_number}
                            onChange={e => setData('next_number', parseInt(e.target.value) || 1)}
                            error={errors.next_number}
                        />
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-600">Preview Kode Pertama</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={generatePreview} className="text-xs text-black">
                            <Eye size={14} className="mr-1" /> Generate
                        </Button>
                    </div>
                    {previewCode ? (
                        <code className="block text-xl font-bold font-mono text-gray-900 text-center py-2">
                            {previewCode}
                        </code>
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-2">Klik "Generate" untuk melihat preview.</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-900"
                    />
                    <Label htmlFor="is_active" className="cursor-pointer mb-0">Prefix Aktif</Label>
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

export default function AssetCodesIndex({ prefixes, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [previews, setPreviews] = useState({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

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
            setPreviews(prev => { const p = { ...prev }; delete p[prefix.id]; return p; });
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

    const handleDeactivate = async (id, name) => {
        if (await window.confirmUI(`Nonaktifkan prefix "${name}"? Prefix tidak dapat dihapus, hanya dinonaktifkan.`)) {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            fetch(`/asset-code-prefixes/${id}/deactivate`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrf },
            }).then(() => router.reload());
        }
    };

    const openCreateModal = async () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (prefix) => {
        setEditData(prefix);
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Kode Aset (Prefix)" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kode Aset (Prefix)</h1>
                        <p className="text-sm text-gray-500">Kelola format penomoran kode aset otomatis.</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus size={16} className="mr-2" /> Tambah Prefix
                    </Button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-black">
                    <strong>Cara kerja:</strong> Setiap prefix mendefinisikan format kode aset. Contoh format: <code className="bg-gray-100 px-1 rounded font-mono">HA-{'{'} PREFIX{'}'}-{'{'} NUMBER{'}'}</code> dengan prefix <code className="bg-gray-100 px-1 rounded font-mono">FF</code> dan panjang angka 4 akan menghasilkan kode <code className="bg-gray-100 px-1 rounded font-mono">HA-FF-0001</code>.
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
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
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xs">
                                                        {prefix.prefix.substring(0, 3)}
                                                    </div>
                                                    <span className="font-mono font-bold text-gray-900">{prefix.prefix}</span>
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
                                                        className="text-xs text-black hover:text-black"
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
                                                        onClick={() => openEditModal(prefix)}
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
                                    : <Link key={i} href={link.url} className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AssetCodePrefixForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editData}
            />
        </AppLayout>
    );
}
