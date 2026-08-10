import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label , Select} from '@/Components/UI';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

export default function AuditSessionCreate({ departments, locations, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        scope_type: 'all',
        scope_ids: [],
        completion_mode: 'flexible',
    });

    const handleScopeChange = (e) => {
        const value = e.target.value;
        setData(data => ({
            ...data,
            scope_type: value,
            scope_ids: [] // reset selections when changing scope type
        }));
    };

    const handleCheckboxChange = (e, id) => {
        const checked = e.target.checked;
        setData('scope_ids', checked 
            ? [...data.scope_ids, id]
            : data.scope_ids.filter(item => item !== id)
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post('/audit-sessions');
    };

    const renderScopeSelection = () => {
        if (data.scope_type === 'all') return null;
        
        let items = [];
        let title = '';
        
        if (data.scope_type === 'department') {
            items = departments;
            title = 'Pilih Departemen Target';
        } else if (data.scope_type === 'location') {
            items = locations;
            title = 'Pilih Lokasi Target';
        } else if (data.scope_type === 'category') {
            items = categories;
            title = 'Pilih Kategori Target';
        }

        if (items.length === 0) return null;

        return (
            <div className="mt-4 p-4 border border-gray-100 rounded-lg bg-gray-50/30">
                <Label className="mb-3 block">{title}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                    {items.map(item => (
                        <label key={item.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                className="rounded text-black focus:ring-gray-900"
                                checked={data.scope_ids.includes(item.id)}
                                onChange={(e) => handleCheckboxChange(e, item.id)}
                            />
                            <span className="text-sm">{item.name} {item.code ? `(${item.code})` : ''}</span>
                        </label>
                    ))}
                </div>
                {errors.scope_ids && <p className="mt-2 text-xs text-red-500">{errors.scope_ids}</p>}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Buat Sesi Audit" />
            
            <div className="p-6 md:p-8 w-full max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buat Sesi Audit Baru</h1>
                        <p className="text-sm text-gray-500">Jadwalkan kegiatan pengecekan fisik/stock opname aset.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-4">
                        {/* Informasi Dasar */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Informasi Dasar</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nama Kegiatan Audit *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        placeholder="Contoh: Audit Tahunan IT 2026"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Deskripsi / Tujuan</Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[100px]`}
                                        placeholder="Tujuan pelaksanaan audit..."
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date">Tanggal Mulai Target</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            error={errors.start_date}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date">Tanggal Selesai Target</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            error={errors.end_date}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pengaturan Scope */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Ruang Lingkup (Scope) & Aturan</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="scope_type">Tentukan Ruang Lingkup Audit *</Label>
                                    <Select
                                        id="scope_type"
                                        value={data.scope_type}
                                        onChange={handleScopeChange}
                                        className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        required
                                    >
                                        <option value="all">Semua Aset (Seluruh Hotel)</option>
                                        <option value="department">Berdasarkan Departemen</option>
                                        <option value="location">Berdasarkan Lokasi Target</option>
                                        <option value="category">Berdasarkan Kategori Aset</option>
                                    </Select>
                                    <p className="mt-1 text-xs text-gray-500">Menentukan jumlah aset target yang wajib diaudit pada sesi ini.</p>
                                    
                                    {renderScopeSelection()}
                                </div>

                                <div>
                                    <Label>Mode Penyelesaian Audit *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                        <label className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${data.completion_mode === 'flexible' ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <input 
                                                    type="radio" 
                                                    name="completion_mode" 
                                                    value="flexible"
                                                    checked={data.completion_mode === 'flexible'}
                                                    onChange={(e) => setData('completion_mode', e.target.value)}
                                                    className="text-black focus:ring-gray-900"
                                                />
                                                <span className="font-bold text-sm">Flexible</span>
                                            </div>
                                            <p className="text-xs text-gray-500 pl-6">Sesi dapat diselesaikan kapan saja, aset yang tidak diaudit akan dianggap hilang/tidak diverifikasi.</p>
                                        </label>
                                        <label className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${data.completion_mode === 'strict' ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <input 
                                                    type="radio" 
                                                    name="completion_mode" 
                                                    value="strict"
                                                    checked={data.completion_mode === 'strict'}
                                                    onChange={(e) => setData('completion_mode', e.target.value)}
                                                    className="text-black focus:ring-gray-900"
                                                />
                                                <span className="font-bold text-sm">Strict (Ketat)</span>
                                            </div>
                                            <p className="text-xs text-gray-500 pl-6">Sesi hanya bisa diselesaikan setelah 100% aset dalam scope telah diverifikasi statusnya.</p>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={processing}>
                            {!processing && <Save size={16} className="mr-2" />}
                            Simpan & Buat Sesi Draft
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
