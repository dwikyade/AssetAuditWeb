import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save } from 'lucide-react';

export default function CategoryEdit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        code: category.code,
        name: category.name,
        description: category.description || '',
        depreciation_months: category.depreciation_months,
        is_active: category.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/categories/${category.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Kategori: ${category.name}`} />
            
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Kategori</h1>
                        <p className="text-sm text-gray-500">{category.name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div>
                            <Label htmlFor="code">Kode Kategori *</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                error={errors.code}
                                required
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="name">Nama Kategori *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="depreciation_months">Usia Penyusutan (Bulan) *</Label>
                            <Input
                                id="depreciation_months"
                                type="number"
                                min="1"
                                value={data.depreciation_months}
                                onChange={(e) => setData('depreciation_months', e.target.value)}
                                error={errors.depreciation_months}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`flex w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]`}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description}</p>}
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                Kategori Aktif
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" isLoading={processing}>
                            {!processing && <Save size={16} className="mr-2" />}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
