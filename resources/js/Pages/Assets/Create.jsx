import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function AssetCreate({ categories, departments, locations, statuses, conditions, prefixes }) {
    const { data, setData, post, processing, errors } = useForm({
        code_mode: 'manual',
        asset_code: '',
        prefix_id: '',
        asset_name: '',
        category_id: '',
        department_id: '',
        location_id: '',
        quantity: 1,
        unit: 'Pcs',
        brand: '',
        model: '',
        serial_number: '',
        acquisition_date: '',
        acquisition_value: 0,
        depreciation_end_date: '',
        book_value: 0,
        status_id: statuses.find(s => s.is_default)?.id || '',
        condition_id: conditions.find(c => c.is_default)?.id || '',
    });

    const [previewCode, setPreviewCode] = useState('');

    const handlePrefixChange = async (e) => {
        const id = e.target.value;
        setData('prefix_id', id);
        
        if (id) {
            try {
                const res = await axios.get(`/asset-code-prefixes/${id}/preview`);
                setPreviewCode(res.data.code);
            } catch (err) {
                console.error(err);
                setPreviewCode('');
            }
        } else {
            setPreviewCode('');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/assets');
    };

    return (
        <AppLayout>
            <Head title="Tambah Aset" />
            
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tambah Aset Baru</h1>
                        <p className="text-sm text-gray-500">Isi formulir di bawah untuk menambahkan aset ke dalam sistem.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-8">
                        {/* Identitas Aset */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Identitas Aset</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Mode Penomoran Kode</Label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="code_mode" 
                                                value="manual"
                                                checked={data.code_mode === 'manual'}
                                                onChange={(e) => setData('code_mode', e.target.value)}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm">Manual</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="code_mode" 
                                                value="auto"
                                                checked={data.code_mode === 'auto'}
                                                onChange={(e) => setData('code_mode', e.target.value)}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm">Otomatis (Prefix)</span>
                                        </label>
                                    </div>
                                </div>

                                {data.code_mode === 'manual' ? (
                                    <div>
                                        <Label htmlFor="asset_code">Kode Aset *</Label>
                                        <Input
                                            id="asset_code"
                                            value={data.asset_code}
                                            onChange={(e) => setData('asset_code', e.target.value.toUpperCase())}
                                            error={errors.asset_code}
                                            placeholder="Contoh: IT-LAP-001"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="prefix_id">Pilih Prefix *</Label>
                                        <select
                                            id="prefix_id"
                                            value={data.prefix_id}
                                            onChange={handlePrefixChange}
                                            className={`flex h-10 w-full rounded-md border ${errors.prefix_id ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                            required
                                        >
                                            <option value="">-- Pilih Prefix --</option>
                                            {prefixes.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.prefix})</option>
                                            ))}
                                        </select>
                                        {errors.prefix_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.prefix_id}</p>}
                                        {previewCode && <p className="mt-1 text-xs text-indigo-600">Preview: {previewCode}</p>}
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <Label htmlFor="asset_name">Nama Aset *</Label>
                                    <Input
                                        id="asset_name"
                                        value={data.asset_name}
                                        onChange={(e) => setData('asset_name', e.target.value)}
                                        error={errors.asset_name}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Kategori *</Label>
                                    <select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className={`flex h-10 w-full rounded-md border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="department_id">Departemen</Label>
                                    <select
                                        id="department_id"
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">-- Tidak Ada --</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="location_id">Lokasi Penempatan</Label>
                                    <select
                                        id="location_id"
                                        value={data.location_id}
                                        onChange={(e) => setData('location_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">-- Tidak Ada --</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Spesifikasi */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Spesifikasi & Kondisi</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <Label htmlFor="brand">Merk / Brand</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        error={errors.brand}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="model">Tipe / Model</Label>
                                    <Input
                                        id="model"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                        error={errors.model}
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <Label htmlFor="serial_number">Nomor Seri / SN</Label>
                                    <Input
                                        id="serial_number"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                        error={errors.serial_number}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="quantity">Jumlah / Qty *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        error={errors.quantity}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="unit">Satuan *</Label>
                                    <Input
                                        id="unit"
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        error={errors.unit}
                                        placeholder="Pcs, Unit, Set, dll"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status_id">Status Aset *</Label>
                                    <select
                                        id="status_id"
                                        value={data.status_id}
                                        onChange={(e) => setData('status_id', e.target.value)}
                                        className={`flex h-10 w-full rounded-md border ${errors.status_id ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        required
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {errors.status_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.status_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="condition_id">Kondisi *</Label>
                                    <select
                                        id="condition_id"
                                        value={data.condition_id}
                                        onChange={(e) => setData('condition_id', e.target.value)}
                                        className={`flex h-10 w-full rounded-md border ${errors.condition_id ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        required
                                    >
                                        <option value="">-- Pilih Kondisi --</option>
                                        {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.condition_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.condition_id}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Finansial */}
                        <section>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Data Finansial</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="acquisition_date">Tanggal Perolehan</Label>
                                    <Input
                                        id="acquisition_date"
                                        type="date"
                                        value={data.acquisition_date}
                                        onChange={(e) => setData('acquisition_date', e.target.value)}
                                        error={errors.acquisition_date}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="acquisition_value">Nilai Perolehan (Rp)</Label>
                                    <Input
                                        id="acquisition_value"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.acquisition_value}
                                        onChange={(e) => setData('acquisition_value', e.target.value)}
                                        error={errors.acquisition_value}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={processing}>
                            {!processing && <Save size={16} className="mr-2" />}
                            Simpan Aset
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
