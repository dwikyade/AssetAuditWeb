import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useState } from 'react';

export default function AssetCodesCreate() {
    const [previewCode, setPreviewCode] = useState('');
    const [previewing, setPreviewing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        prefix: '',
        name: '',
        description: '',
        format: '{PREFIX}-{NUMBER}',
        number_length: 4,
        next_number: 1,
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/asset-code-prefixes');
    };

    // Live preview without API call
    const generatePreview = () => {
        if (!data.prefix || !data.format) return;
        const number = String(data.next_number || 1).padStart(data.number_length || 4, '0');
        const code = data.format
            .replace('{PREFIX}', data.prefix.toUpperCase())
            .replace('{NUMBER}', number);
        setPreviewCode(code);
    };

    return (
        <AppLayout>
            <Head title="Tambah Prefix Kode Aset" />
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/asset-code-prefixes')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tambah Prefix Kode Aset</h1>
                        <p className="text-sm text-gray-500">Definisikan format penomoran aset baru.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="prefix">Prefix <span className="text-red-500">*</span></Label>
                                <Input
                                    id="prefix"
                                    value={data.prefix}
                                    onChange={e => setData('prefix', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                                    placeholder="contoh: FF, KIT, LBY"
                                    className="mt-1 uppercase font-mono"
                                    maxLength={20}
                                />
                                {errors.prefix && <p className="text-red-500 text-xs mt-1">{errors.prefix}</p>}
                                <p className="text-xs text-gray-400 mt-1">Singkatan unik untuk kategori/departemen ini.</p>
                            </div>
                            <div>
                                <Label htmlFor="name">Nama Prefix <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="contoh: Front Office, Kitchen"
                                    className="mt-1"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="format">Format Kode <span className="text-red-500">*</span></Label>
                            <Input
                                id="format"
                                value={data.format}
                                onChange={e => setData('format', e.target.value)}
                                placeholder="contoh: HA-{PREFIX}-{NUMBER}"
                                className="mt-1 font-mono"
                            />
                            {errors.format && <p className="text-red-500 text-xs mt-1">{errors.format}</p>}
                            <p className="text-xs text-gray-400 mt-1">
                                Gunakan <code className="bg-gray-100 px-1 rounded">{'{'+'PREFIX'+'}'}</code> untuk prefix dan <code className="bg-gray-100 px-1 rounded">{'{'+'NUMBER'+'}'}</code> untuk nomor urut.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="number_length">Panjang Digit Nomor <span className="text-red-500">*</span></Label>
                                <Input
                                    id="number_length"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.number_length}
                                    onChange={e => setData('number_length', parseInt(e.target.value) || 4)}
                                    className="mt-1"
                                />
                                {errors.number_length && <p className="text-red-500 text-xs mt-1">{errors.number_length}</p>}
                                <p className="text-xs text-gray-400 mt-1">Angka akan diisi nol di depan hingga panjang ini.</p>
                            </div>
                            <div>
                                <Label htmlFor="next_number">Nomor Awal <span className="text-red-500">*</span></Label>
                                <Input
                                    id="next_number"
                                    type="number"
                                    min={1}
                                    value={data.next_number}
                                    onChange={e => setData('next_number', parseInt(e.target.value) || 1)}
                                    className="mt-1"
                                />
                                {errors.next_number && <p className="text-red-500 text-xs mt-1">{errors.next_number}</p>}
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-gray-600">Preview Kode Pertama</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={generatePreview} className="text-xs text-indigo-600">
                                    <Eye size={14} className="mr-1" /> Generate
                                </Button>
                            </div>
                            {previewCode ? (
                                <code className="block text-xl font-bold font-mono text-indigo-700 text-center py-2">
                                    {previewCode}
                                </code>
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-2">Klik "Generate" untuk melihat preview kode.</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Prefix Aktif (langsung bisa digunakan)</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button type="button" variant="secondary" onClick={() => router.get('/asset-code-prefixes')}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save size={16} className="mr-2" />
                                {processing ? 'Menyimpan...' : 'Simpan Prefix'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
