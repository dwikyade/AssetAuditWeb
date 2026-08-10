import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label , Select} from '@/Components/UI';
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
            
            <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-4">
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
                    <div className="p-6 space-y-6">
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
                                                className="text-black focus:ring-gray-900"
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
                                                className="text-black focus:ring-gray-900"
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
                                        <Select
                                            id="prefix_id"
                                            value={data.prefix_id}
                                            onChange={handlePrefixChange}
                                            className={`flex h-10 w-full rounded-xl border ${errors.prefix_id ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-3.5 py-2 text-sm focus:bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm`}
                                            required
                                        >
                                            <option value="">-- Pilih Prefix --</option>
                                            {prefixes.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.prefix})</option>
                                            ))}
                                        </Select>
                                        {errors.prefix_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.prefix_id}</p>}
                                        {previewCode && <p className="mt-1 text-xs text-black">Preview: {previewCode}</p>}
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
                                    <Select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className={`flex h-10 w-full rounded-xl border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm`}
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="department_id">Departemen</Label>
                                    <Select
                                        id="department_id"
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                                    >
                                        <option value="">-- Tidak Ada --</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="location_id">Lokasi Penempatan</Label>
                                    <Select
                                        id="location_id"
                                        value={data.location_id}
                                        onChange={(e) => setData('location_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                                    >
                                        <option value="">-- Tidak Ada --</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </Select>
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
                                    <Select
                                        id="status_id"
                                        value={data.status_id}
                                        onChange={(e) => setData('status_id', e.target.value)}
                                        className={`flex h-10 w-full rounded-xl border ${errors.status_id ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm`}
                                        required
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </Select>
                                    {errors.status_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.status_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="condition_id">Kondisi *</Label>
                                    <Select
                                        id="condition_id"
                                        value={data.condition_id}
                                        onChange={(e) => setData('condition_id', e.target.value)}
                                        className={`flex h-10 w-full rounded-xl border ${errors.condition_id ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm`}
                                        required
                                    >
                                        <option value="">-- Pilih Kondisi --</option>
                                        {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Select>
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

            <div className="xl:col-span-1 space-y-6 pt-2 xl:pt-20">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Panduan Pengisian
                    </h3>
                    <div className="space-y-4 text-sm text-gray-600">
                        <div>
                            <strong className="text-gray-900 block mb-1">Mode Penomoran</strong>
                            <p>Gunakan <b>Otomatis</b> untuk menghasilkan kode unik berdasarkan prefix (contoh: LPT-0001). Gunakan <b>Manual</b> jika Anda memiliki kode referensi sendiri.</p>
                        </div>
                        <div>
                            <strong className="text-gray-900 block mb-1">Status & Kondisi</strong>
                            <p>Pastikan memilih status awal dan kondisi fisik dengan benar, karena ini sangat krusial untuk sesi audit kedepannya.</p>
                        </div>
                        <div>
                            <strong className="text-gray-900 block mb-1">Data Finansial</strong>
                            <p>Nilai perolehan akan digunakan untuk perhitungan depresiasi. Kosongkan jika bukan aset bernilai finansial terukur.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</AppLayout>
    );
}
