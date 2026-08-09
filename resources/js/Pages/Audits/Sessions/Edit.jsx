import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const Select = ({ children, ...props }) => (
    <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...props}
    >
        {children}
    </select>
);

const Textarea = ({ ...props }) => (
    <textarea
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        rows={3}
        {...props}
    />
);

const FormField = ({ label, error, required, children }) => (
    <div>
        <Label className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

export default function AuditSessionEdit({ session, departments, locations, categories }) {
    const isLocked = !['draft', 'scheduled'].includes(session.status);

    const { data, setData, put, processing, errors } = useForm({
        name:            session.name ?? '',
        description:     session.description ?? '',
        start_date:      session.start_date ?? '',
        end_date:        session.end_date ?? '',
        scope_type:      session.scope_type ?? 'all',
        scope_ids:       session.scope_ids ?? [],
        completion_mode: session.completion_mode ?? 'flexible',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/audit-sessions/${session.id}`, {
            onSuccess: () => router.visit(`/audit-sessions/${session.id}`),
        });
    };

    const scopeOptions = {
        all:       { label: 'Semua Aset', options: [] },
        department: { label: 'Per Departemen', options: departments },
        location:  { label: 'Per Lokasi', options: locations },
        category:  { label: 'Per Kategori', options: categories },
    };

    const handleScopeIdToggle = (id) => {
        const parsed = Number(id);
        setData('scope_ids', data.scope_ids.includes(parsed)
            ? data.scope_ids.filter(x => x !== parsed)
            : [...data.scope_ids, parsed]
        );
    };

    return (
        <AppLayout>
            <Head title={`Edit Sesi Audit: ${session.name}`} />

            <div className="p-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/audit-sessions/${session.id}`)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Sesi Audit</h1>
                        <p className="text-sm font-mono text-indigo-600">{session.code}</p>
                    </div>
                </div>

                {isLocked && (
                    <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Sesi Tidak Dapat Diedit</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Sesi dengan status <strong>{session.status}</strong> tidak dapat diubah. Hanya sesi berstatus Draft atau Dijadwalkan yang dapat diedit.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200">Informasi Sesi Audit</h3>

                        <FormField label="Nama Sesi Audit" error={errors.name} required>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Stock Opname Hotel 2026"
                                disabled={isLocked}
                            />
                        </FormField>

                        <FormField label="Deskripsi" error={errors.description}>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Keterangan tambahan tentang sesi audit ini..."
                                disabled={isLocked}
                            />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField label="Tanggal Mulai" error={errors.start_date}>
                                <Input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} disabled={isLocked} />
                            </FormField>
                            <FormField label="Tanggal Selesai" error={errors.end_date}>
                                <Input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} disabled={isLocked} />
                            </FormField>
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200">Cakupan Audit (Scope)</h3>

                        <FormField label="Tipe Scope" error={errors.scope_type} required>
                            <Select value={data.scope_type} onChange={(e) => setData('scope_type', e.target.value)} disabled={isLocked}>
                                <option value="all">Semua Aset</option>
                                <option value="department">Per Departemen</option>
                                <option value="location">Per Lokasi</option>
                                <option value="category">Per Kategori</option>
                            </Select>
                        </FormField>

                        {data.scope_type !== 'all' && data.scope_type !== 'selection' && (
                            <div>
                                <Label className="mb-2 block text-sm font-medium text-gray-700">
                                    Pilih {scopeOptions[data.scope_type]?.label ?? ''}
                                    <span className="text-gray-400 font-normal ml-1">(pilih satu atau lebih)</span>
                                </Label>
                                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                    {(scopeOptions[data.scope_type]?.options ?? []).map(opt => (
                                        <label key={opt.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={data.scope_ids.includes(opt.id)}
                                                onChange={() => !isLocked && handleScopeIdToggle(opt.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                disabled={isLocked}
                                            />
                                            <span className="text-sm text-gray-800">{opt.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Completion Mode */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200">Mode Penyelesaian</h3>

                        <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${data.completion_mode === 'flexible' ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'} ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                            <input
                                type="radio" name="completion_mode" value="flexible"
                                checked={data.completion_mode === 'flexible'}
                                onChange={(e) => !isLocked && setData('completion_mode', e.target.value)}
                                className="mt-0.5" disabled={isLocked}
                            />
                            <div>
                                <p className="font-medium text-sm text-gray-900">Flexible</p>
                                <p className="text-xs text-gray-500 mt-0.5">Sesi dapat diselesaikan meskipun belum semua aset diaudit.</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${data.completion_mode === 'strict' ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'} ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                            <input
                                type="radio" name="completion_mode" value="strict"
                                checked={data.completion_mode === 'strict'}
                                onChange={(e) => !isLocked && setData('completion_mode', e.target.value)}
                                className="mt-0.5" disabled={isLocked}
                            />
                            <div>
                                <p className="font-medium text-sm text-gray-900">Strict</p>
                                <p className="text-xs text-gray-500 mt-0.5">Semua aset dalam scope harus diaudit sebelum sesi dapat diselesaikan.</p>
                            </div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <Button type="button" variant="ghost" onClick={() => router.visit(`/audit-sessions/${session.id}`)}>
                            Batal
                        </Button>
                        {!isLocked && (
                            <Button type="submit" isLoading={processing}>
                                <Save size={16} className="mr-2" />
                                Simpan Perubahan
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
