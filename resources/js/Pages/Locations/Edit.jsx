import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save } from 'lucide-react';

export default function LocationsEdit({ location, parents }) {
    const { data, setData, put, processing, errors } = useForm({
        code: location.code || '',
        name: location.name || '',
        parent_id: location.parent_id || '',
        description: location.description || '',
        is_active: location.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/locations/${location.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Lokasi — ${location.name}`} />
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/locations')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Lokasi</h1>
                        <p className="text-sm text-gray-500">Perbarui data lokasi <span className="font-semibold text-indigo-600">{location.name}</span>.</p>
                    </div>
                </div>

                {location.assets_count > 0 && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm flex gap-2">
                        <span>ℹ️</span>
                        <span>Lokasi ini memiliki <strong>{location.assets_count} aset</strong> terdaftar.</span>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="code">Kode Lokasi <span className="text-red-500">*</span></Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    className="mt-1 uppercase"
                                />
                                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                            </div>
                            <div>
                                <Label htmlFor="name">Nama Lokasi <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="parent_id">Lokasi Induk (opsional)</Label>
                            <select
                                id="parent_id"
                                value={data.parent_id}
                                onChange={e => setData('parent_id', e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Tidak ada (Lokasi Utama) --</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                ))}
                            </select>
                            {errors.parent_id && <p className="text-red-500 text-xs mt-1">{errors.parent_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Lokasi Aktif</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button type="button" variant="secondary" onClick={() => router.get('/locations')}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save size={16} className="mr-2" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
