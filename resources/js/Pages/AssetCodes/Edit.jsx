import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save, Eye, Hash } from 'lucide-react';
import { useState } from 'react';

export default function AssetCodesEdit({ prefix }) {
    const [previewCode, setPreviewCode] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        name: prefix.name || '',
        description: prefix.description || '',
        format: prefix.format || '{PREFIX}-{NUMBER}',
        number_length: prefix.number_length || 4,
        next_number: prefix.next_number || 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/asset-code-prefixes/${prefix.id}`);
    };

    const generatePreview = () => {
        const number = String(data.next_number || 1).padStart(data.number_length || 4, '0');
        const code = data.format
            .replace('{PREFIX}', prefix.prefix)
            .replace('{NUMBER}', number);
        setPreviewCode(code);
    };

    return (
        <AppLayout>
            <Head title={`Edit Prefix — ${prefix.prefix}`} />
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/asset-code-prefixes')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Prefix Kode Aset</h1>
                        <p className="text-sm text-gray-500">Perbarui konfigurasi prefix <span className="font-mono font-bold text-indigo-600">{prefix.prefix}</span>.</p>
                    </div>
                </div>

                {/* Read-only prefix badge */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Hash size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-600 font-medium">Prefix (tidak dapat diubah)</p>
                        <p className="font-mono font-bold text-indigo-900 text-xl">{prefix.prefix}</p>
                    </div>
                    <div className="ml-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${prefix.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {prefix.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="name">Nama Prefix <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                                Gunakan <code className="bg-gray-100 px-1 rounded">{'{'+'PREFIX'+'}'}</code> dan <code className="bg-gray-100 px-1 rounded">{'{'+'NUMBER'+'}'}</code> sebagai placeholder.
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
                            </div>
                            <div>
                                <Label htmlFor="next_number">Nomor Berikutnya <span className="text-red-500">*</span></Label>
                                <Input
                                    id="next_number"
                                    type="number"
                                    min={1}
                                    value={data.next_number}
                                    onChange={e => setData('next_number', parseInt(e.target.value) || 1)}
                                    className="mt-1"
                                />
                                {errors.next_number && <p className="text-red-500 text-xs mt-1">{errors.next_number}</p>}
                                <p className="text-xs text-amber-600 mt-1">⚠ Hati-hati mengubah ini — dapat menyebabkan duplikasi kode.</p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={2}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>

                        {/* Live Preview */}
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-gray-600">Preview Kode Berikutnya</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={generatePreview} className="text-xs text-indigo-600">
                                    <Eye size={14} className="mr-1" /> Generate
                                </Button>
                            </div>
                            {previewCode ? (
                                <code className="block text-xl font-bold font-mono text-indigo-700 text-center py-2">
                                    {previewCode}
                                </code>
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-2">Klik "Generate" untuk melihat preview kode berikutnya.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button type="button" variant="secondary" onClick={() => router.get('/asset-code-prefixes')}>
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
