import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { formatRole } from '@/lib/utils';

export default function UsersCreate({ roles }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0]?.name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <AppLayout>
            <Head title="Tambah Pengguna" />
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/users')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna</h1>
                        <p className="text-sm text-gray-500">Buat akun pengguna baru untuk sistem.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama lengkap..." className="mt-1" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@hotel.com" className="mt-1" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="role">Role / Hak Akses <span className="text-red-500">*</span></Label>
                            <select id="role" value={data.role} onChange={e => setData('role', e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                {roles.map(r => <option key={r.id} value={r.name}>{formatRole(r.name)}</option>)}
                            </select>
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                <div className="relative mt-1">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Min. 8 karakter" className="pr-10" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Password <span className="text-red-500">*</span></Label>
                                <div className="relative mt-1">
                                    <Input id="password_confirmation" type={showConfirm ? 'text' : 'password'} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Ulangi password" className="pr-10" />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowConfirm(!showConfirm)}>
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button type="button" variant="secondary" onClick={() => router.get('/users')}>Batal</Button>
                            <Button type="submit" disabled={processing}>
                                <Save size={16} className="mr-2" />
                                {processing ? 'Menyimpan...' : 'Buat Pengguna'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
