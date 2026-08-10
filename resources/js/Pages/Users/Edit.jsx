import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label , Select} from '@/Components/UI';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { getInitials, formatRole } from '@/lib/utils';

export default function UsersEdit({ user, roles }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.roles[0]?.name || roles[0]?.name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Pengguna — ${user.name}`} />
            <div className="p-6 md:p-8 w-full max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.get('/users')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Pengguna</h1>
                        <p className="text-sm text-gray-500">Perbarui data akun pengguna <span className="font-semibold text-black">{user.name}</span>.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xl">
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="role">Role / Hak Akses <span className="text-red-500">*</span></Label>
                            <Select id="role" value={data.role} onChange={e => setData('role', e.target.value)}
                                className="mt-1 flex min-h-[40px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm">
                                {roles.map(r => <option key={r.id} value={r.name}>{formatRole(r.name)}</option>)}
                            </Select>
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                            <p className="text-sm font-medium text-gray-700">Ubah Password (biarkan kosong jika tidak diubah)</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password">Password Baru</Label>
                                    <div className="relative mt-1">
                                        <Input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Min. 8 karakter" className="pr-10" />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="password_confirmation">Konfirmasi</Label>
                                    <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Ulangi password baru" className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button type="button" variant="secondary" onClick={() => router.get('/users')}>Batal</Button>
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
