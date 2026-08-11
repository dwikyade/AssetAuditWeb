import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label, Modal, Select } from '@/Components/UI';
import { Search, Plus, Edit, Trash, Users, Eye, EyeOff, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getInitials, formatRole } from '@/lib/utils';

function UserForm({ isOpen, onClose, initialData = null, roles = [] }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0]?.name || '',
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setData({
                    name: initialData.name || '',
                    email: initialData.email || '',
                    password: '',
                    password_confirmation: '',
                    role: initialData.roles?.[0]?.name || roles[0]?.name || '',
                });
            } else {
                reset();
                setData('role', roles[0]?.name || '');
            }
            clearErrors();
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (initialData) {
            put(`/users/${initialData.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/users', {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={initialData ? 'Edit Pengguna' : 'Tambah Pengguna'}
            maxWidth="max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama lengkap..." className="mt-1" required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@hotel.com" className="mt-1" required />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                    <Label htmlFor="role">Role / Hak Akses *</Label>
                    <Select id="role" value={data.role} onChange={e => setData('role', e.target.value)}
                        className="mt-1 flex min-h-[40px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm" required>
                        {roles.map(r => <option key={r.id} value={r.name}>{formatRole(r.name)}</option>)}
                    </Select>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="password">Password {initialData ? '(Opsional)' : '*'}</Label>
                        <div className="relative mt-1">
                            <Input id="password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Min. 8 karakter" className="pr-10" required={!initialData} />
                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {initialData && <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password.</p>}
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation">Konfirmasi Password {initialData ? '(Opsional)' : '*'}</Label>
                        <div className="relative mt-1">
                            <Input id="password_confirmation" type={showConfirm ? 'text' : 'password'} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Ulangi password" className="pr-10" required={!initialData && !!data.password} />
                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                    <Button type="submit" disabled={processing}>
                        <Save size={16} className="mr-2" />
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default function UsersIndex({ users, filters, roles }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/users', { search }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleDelete = async (id, name) => {
        if (await window.confirmUI(`Hapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/users/${id}`);
        }
    };

    const openCreateModal = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditData(user);
        setIsModalOpen(true);
    };

    const roleColors = {
        super_admin: 'bg-red-100 text-red-700 border-red-200',
        admin: 'bg-gray-100 text-gray-900 border-gray-200',
        auditor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        viewer: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <AppLayout>
            <Head title="Manajemen Pengguna" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
                        <p className="text-sm text-gray-500">Kelola akun pengguna dan akses sistem.</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus size={16} className="mr-2" /> Tambah Pengguna
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="w-full max-w-md">
                            <Input
                                type="text"
                                placeholder="Cari nama atau email..."
                                icon={Search}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Pengguna</th>
                                    <th className="px-6 py-3 font-medium">Email</th>
                                    <th className="px-6 py-3 font-medium">Role</th>
                                    <th className="px-6 py-3 font-medium text-center">Terdaftar</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <Users size={40} className="mx-auto mb-2 opacity-20" />
                                            Tidak ada pengguna yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">{user.email}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <span key={role.id} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[role.name] || roleColors.viewer}`}>
                                                            {formatRole(role.name)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} title="Edit">
                                                        <Edit size={16} className="text-amber-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id, user.name)} title="Hapus">
                                                        <Trash size={16} className="text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {users.links && users.links.length > 3 && (
                        <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-1 justify-end">
                            {users.links.map((link, i) => {
                                if (link.url === null) {
                                    return <div key={i} className="px-3 py-1 text-sm border border-gray-200 text-gray-400 rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: link.label }} />;
                                }
                                return (
                                    <Link 
                                        key={i} 
                                        href={link.url}
                                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active ? 'bg-black border-black text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <UserForm 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editData}
                roles={roles}
            />
        </AppLayout>
    );
}
