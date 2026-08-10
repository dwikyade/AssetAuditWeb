import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label , Select} from '@/Components/UI';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const FormField = ({ label, error, required, children }) => (
    <div>
        <Label className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const Textarea = ({ className = '', ...props }) => (
    <textarea
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none ${className}`}
        rows={3}
        {...props}
    />
);

const Select = ({ className = '', children, ...props }) => (
    <Select
        className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 ${className}`}
        {...props}
    >
        {children}
    </Select>
);

const SectionTitle = ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200 mb-4">{children}</h3>
);

export default function AssetEdit({ asset, categories, departments, locations, statuses, conditions }) {
    const { data, setData, put, processing, errors } = useForm({
        asset_name:    asset.asset_name ?? '',
        description:   asset.description ?? '',
        category_id:   asset.category_id ?? '',
        department_id: asset.department_id ?? '',
        location_id:   asset.location_id ?? '',
        quantity:      asset.quantity ?? 1,
        unit:          asset.unit ?? 'Pcs',
        brand:         asset.brand ?? '',
        model:         asset.model ?? '',
        serial_number: asset.serial_number ?? '',
        acquisition_date:                  asset.acquisition_date?.split('T')[0] ?? '',
        depreciation_end_date:             asset.depreciation_end_date?.split('T')[0] ?? '',
        acquisition_value:                 asset.acquisition_value ?? '',
        previous_accumulated_depreciation: asset.previous_accumulated_depreciation ?? '',
        accumulated_depreciation:          asset.accumulated_depreciation ?? '',
        depreciation_per_period:           asset.depreciation_per_period ?? '',
        book_value:                        asset.book_value ?? '',
        status_id:    asset.status_id ?? '',
        condition_id: asset.condition_id ?? '',
        notes:        asset.notes ?? '',
        move_reason:  '',
    });

    const locationChanged = data.location_id != asset.location_id || data.department_id != asset.department_id;

    const submit = (e) => {
        e.preventDefault();
        put(`/assets/${asset.id}`, {
            onSuccess: () => router.visit(`/assets/${asset.id}`),
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit Aset: ${asset.asset_code}`} />

            <div className="p-6 md:p-8 w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/assets/${asset.id}`)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Aset</h1>
                        <p className="text-sm font-mono text-black">{asset.asset_code}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Asset Code (read only) */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Kode Aset Tidak Dapat Diubah</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Kode aset <strong>{asset.asset_code}</strong> bersifat permanen. Hubungi Super Admin jika perlu perubahan kode.
                            </p>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionTitle>Informasi Dasar</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Nama Aset" error={errors.asset_name} required>
                                <Input
                                    value={data.asset_name}
                                    onChange={(e) => setData('asset_name', e.target.value)}
                                    placeholder="Contoh: Kursi Sofa 3-Seater"
                                />
                            </FormField>
                            <FormField label="Kategori" error={errors.category_id}>
                                <Select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}>
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Brand / Merek" error={errors.brand}>
                                <Input value={data.brand} onChange={(e) => setData('brand', e.target.value)} placeholder="Contoh: Herman Miller" />
                            </FormField>
                            <FormField label="Model" error={errors.model}>
                                <Input value={data.model} onChange={(e) => setData('model', e.target.value)} placeholder="Contoh: Aeron Chair" />
                            </FormField>
                            <FormField label="Serial Number" error={errors.serial_number}>
                                <Input value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} placeholder="S/N opsional" />
                            </FormField>
                            <FormField label="Deskripsi" error={errors.description}>
                                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Keterangan tambahan..." />
                            </FormField>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionTitle>Lokasi & Departemen</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormField label="Departemen" error={errors.department_id}>
                                <Select value={data.department_id} onChange={(e) => setData('department_id', e.target.value)}>
                                    <option value="">-- Pilih Departemen --</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Lokasi" error={errors.location_id}>
                                <Select value={data.location_id} onChange={(e) => setData('location_id', e.target.value)}>
                                    <option value="">-- Pilih Lokasi --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </Select>
                            </FormField>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Qty" error={errors.quantity} required>
                                    <Input type="number" min="0" step="0.01" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                                </FormField>
                                <FormField label="Satuan" error={errors.unit}>
                                    <Input value={data.unit} onChange={(e) => setData('unit', e.target.value)} placeholder="Pcs" />
                                </FormField>
                            </div>
                        </div>

                        {/* Move reason — shown only if location/dept changed */}
                        {locationChanged && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-800 mb-2">⚠️ Lokasi/Departemen diubah — catatan alasan diperlukan</p>
                                <FormField label="Alasan Perpindahan" error={errors.move_reason}>
                                    <Input
                                        value={data.move_reason}
                                        onChange={(e) => setData('move_reason', e.target.value)}
                                        placeholder="Contoh: Renovasi ruang, dipindah ke gudang, dll."
                                    />
                                </FormField>
                            </div>
                        )}
                    </div>

                    {/* Condition */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionTitle>Status & Kondisi</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Status Aset" error={errors.status_id}>
                                <Select value={data.status_id} onChange={(e) => setData('status_id', e.target.value)}>
                                    <option value="">-- Pilih Status --</option>
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Kondisi Fisik" error={errors.condition_id}>
                                <Select value={data.condition_id} onChange={(e) => setData('condition_id', e.target.value)}>
                                    <option value="">-- Pilih Kondisi --</option>
                                    {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Catatan" error={errors.notes}>
                                    <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Catatan kondisi aset..." rows={2} />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Accounting */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <SectionTitle>Informasi Akuntansi (Opsional)</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Tanggal Perolehan" error={errors.acquisition_date}>
                                <Input type="date" value={data.acquisition_date} onChange={(e) => setData('acquisition_date', e.target.value)} />
                            </FormField>
                            <FormField label="Tanggal Akhir Susut" error={errors.depreciation_end_date}>
                                <Input type="date" value={data.depreciation_end_date} onChange={(e) => setData('depreciation_end_date', e.target.value)} />
                            </FormField>
                            <FormField label="Nilai Perolehan (Rp)" error={errors.acquisition_value}>
                                <Input type="number" min="0" value={data.acquisition_value} onChange={(e) => setData('acquisition_value', e.target.value)} placeholder="0" />
                            </FormField>
                            <FormField label="Akumulasi Susut Sebelum (Rp)" error={errors.previous_accumulated_depreciation}>
                                <Input type="number" min="0" value={data.previous_accumulated_depreciation} onChange={(e) => setData('previous_accumulated_depreciation', e.target.value)} placeholder="0" />
                            </FormField>
                            <FormField label="Akumulasi Susut Total (Rp)" error={errors.accumulated_depreciation}>
                                <Input type="number" min="0" value={data.accumulated_depreciation} onChange={(e) => setData('accumulated_depreciation', e.target.value)} placeholder="0" />
                            </FormField>
                            <FormField label="Susut per Periode (Rp)" error={errors.depreciation_per_period}>
                                <Input type="number" min="0" value={data.depreciation_per_period} onChange={(e) => setData('depreciation_per_period', e.target.value)} placeholder="0" />
                            </FormField>
                            <FormField label="Nilai Buku (Rp)" error={errors.book_value}>
                                <Input type="number" min="0" value={data.book_value} onChange={(e) => setData('book_value', e.target.value)} placeholder="0" />
                            </FormField>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between py-2">
                        <Button type="button" variant="ghost" onClick={() => router.visit(`/assets/${asset.id}`)}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={processing}>
                            <Save size={16} className="mr-2" />
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
