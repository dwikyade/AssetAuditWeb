import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { Plus, Trash, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';

const COLOR_PRESETS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#6b7280',
];

function StatusForm({ onSave, onCancel, initial = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: initial?.code || '',
        name: initial?.name || '',
        color: initial?.color || '#6b7280',
        description: initial?.description || '',
        sort_order: initial?.sort_order || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initial) {
            put(`/asset-statuses/${initial.id}`, {
                onSuccess: () => onSave(),
            });
        } else {
            post('/asset-statuses', {
                onSuccess: () => { reset(); onSave(); },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-indigo-900">{initial ? 'Edit Status' : 'Tambah Status Baru'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {!initial && (
                    <div>
                        <Label htmlFor="code">Kode <span className="text-red-500">*</span></Label>
                        <Input id="code" value={data.code} onChange={e => setData('code', e.target.value.toLowerCase().replace(/\s+/g, '_'))} placeholder="active, lost..." className="mt-1" />
                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                    </div>
                )}
                <div>
                    <Label htmlFor="s_name">Nama <span className="text-red-500">*</span></Label>
                    <Input id="s_name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama status..." className="mt-1" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <Label>Warna</Label>
                    <div className="flex gap-2 mt-1 flex-wrap">
                        {COLOR_PRESETS.map(c => (
                            <button key={c} type="button" onClick={() => setData('color', c)}
                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${data.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }} />
                        ))}
                        <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" title="Custom warna" />
                    </div>
                </div>
                <div>
                    <Label htmlFor="s_sort">Urutan</Label>
                    <Input id="s_sort" type="number" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} className="mt-1" />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={onCancel}><X size={14} className="mr-1" />Batal</Button>
                <Button type="submit" size="sm" disabled={processing}><Save size={14} className="mr-1" />{processing ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
        </form>
    );
}

export default function StatusesIndex({ statuses }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleDelete = (id, name) => {
        if (confirm(`Hapus status "${name}"?`)) {
            router.delete(`/asset-statuses/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Status Aset" />
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Status Aset</h1>
                        <p className="text-sm text-gray-500">Kelola daftar status kondisi kepemilikan aset hotel.</p>
                    </div>
                    {!showCreate && (
                        <Button onClick={() => setShowCreate(true)}>
                            <Plus size={16} className="mr-2" /> Tambah Status
                        </Button>
                    )}
                </div>

                {showCreate && (
                    <StatusForm onSave={() => { setShowCreate(false); router.reload(); }} onCancel={() => setShowCreate(false)} />
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Kode</th>
                                <th className="px-6 py-3 font-medium text-center">Jumlah Aset</th>
                                <th className="px-6 py-3 font-medium text-center">Aktif</th>
                                <th className="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {statuses.map((status) => (
                                <>
                                    <tr key={status.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                                                <span className="font-medium text-gray-900">{status.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-mono text-indigo-700 text-xs">{status.code}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-100">{status.assets_count}</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {status.is_active ? 'Ya' : 'Tidak'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => setEditId(editId === status.id ? null : status.id)} title="Edit">
                                                    <Edit size={16} className="text-amber-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(status.id, status.name)} title="Hapus">
                                                    <Trash size={16} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editId === status.id && (
                                        <tr key={`edit-${status.id}`}>
                                            <td colSpan="5" className="px-6 py-3 bg-gray-50">
                                                <StatusForm
                                                    initial={status}
                                                    onSave={() => { setEditId(null); router.reload(); }}
                                                    onCancel={() => setEditId(null)}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            {statuses.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Belum ada data status aset.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
