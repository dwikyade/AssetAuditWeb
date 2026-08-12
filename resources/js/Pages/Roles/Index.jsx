import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { Shield, ChevronDown, ChevronUp, Users, Trash, Plus, X, Save } from 'lucide-react';
import { useState } from 'react';
import { formatRole } from '@/lib/utils';

const PERMISSION_GROUPS = {
    'Aset': ['asset.view', 'asset.create', 'asset.update', 'asset.delete', 'asset.import', 'asset.export'],
    'Audit': ['audit.view', 'audit.create', 'audit.update', 'audit.conduct'],
    'Laporan': ['report.view'],
    'Master Data': ['category.manage', 'department.manage', 'location.manage', 'prefix.manage'],
    'User & Admin': ['user.view', 'user.create', 'user.update', 'user.delete', 'activity-log.view'],
};

function RoleCard({ role, permissions, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);

    const { data, setData, put, processing } = useForm({
        permissions: role.permissions.map(p => p.name),
    });

    const togglePermission = async (perm) => {
        setData('permissions',
            data.permissions.includes(perm)
                ? data.permissions.filter(p => p !== perm)
                : [...data.permissions, perm]
        );
    };

    const handleSave = async () => {
        put(`/roles/${role.id}`, {
            onSuccess: () => { setEditing(false); router.reload(); },
        });
    };

    const isSuperAdmin = role.name === 'super_admin';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSuperAdmin ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-black'}`}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{formatRole(role.name)}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} />{role.users_count} pengguna</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isSuperAdmin && (
                        <>
                            <Button variant="secondary" size="sm" onClick={() => { setEditing(!editing); setExpanded(true); }}>
                                {editing ? 'Batal' : 'Edit Permissions'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(role.id, role.name)} title="Hapus Role">
                                <Trash size={16} className="text-red-500" />
                            </Button>
                        </>
                    )}
                    <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {isSuperAdmin ? (
                        <p className="text-sm text-gray-600 italic">Role Super Admin memiliki akses penuh ke semua fitur sistem dan tidak dapat diubah.</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                                <div key={group}>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{group}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {perms.map(perm => {
                                            const has = editing ? data.permissions.includes(perm) : role.permissions.some(p => p.name === perm);
                                            return (
                                                <button
                                                    key={perm}
                                                    type="button"
                                                    onClick={() => editing && togglePermission(perm)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
                                                        ${has
                                                            ? 'bg-gray-100 text-gray-900 border-gray-200'
                                                            : 'bg-white text-gray-400 border-gray-200'}
                                                        ${editing ? 'cursor-pointer hover:border-gray-400' : 'cursor-default'}`}
                                                >
                                                    {perm}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {editing && (
                                <div className="flex justify-end pt-2">
                                    <Button size="sm" onClick={handleSave} disabled={processing}>
                                        <Save size={14} className="mr-1" />
                                        {processing ? 'Menyimpan...' : 'Simpan Permissions'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CreateRoleForm({ permissions, onSave, onCancel }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        post('/roles', { onSuccess: () => { reset(); onSave(); } });
    };

    const togglePerm = async (perm) => {
        setData('permissions', data.permissions.includes(perm)
            ? data.permissions.filter(p => p !== perm)
            : [...data.permissions, perm]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-black">Buat Role Baru</h3>
            <div>
                <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Nama role (contoh: manager)"
                    value={data.name}
                    onChange={e => setData('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-3">
                {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                    <div key={group}>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{group}</p>
                        <div className="flex flex-wrap gap-2">
                            {perms.map(perm => (
                                <button key={perm} type="button" onClick={() => togglePerm(perm)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors
                                        ${data.permissions.includes(perm) ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
                                    {perm}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={onCancel}><X size={14} className="mr-1" />Batal</Button>
                <Button type="submit" size="sm" disabled={processing}><Save size={14} className="mr-1" />{processing ? 'Membuat...' : 'Buat Role'}</Button>
            </div>
        </form>
    );
}

export default function RolesIndex({ roles, permissions }) {
    const [showCreate, setShowCreate] = useState(false);

    const handleDelete = async (id, name) => {
        if (await window.confirmUI(`Hapus role "${formatRole(name)}"?`)) router.delete(`/roles/${id}`);
    };

    return (
        <AppLayout>
            <Head title="Roles & Permissions" />
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                        <p className="text-sm text-gray-500">Kelola hak akses dan peran pengguna di sistem.</p>
                    </div>
                    {!showCreate && (
                        <Button onClick={() => setShowCreate(true)}>
                            <Plus size={16} className="mr-2" /> Buat Role Baru
                        </Button>
                    )}
                </div>

                {showCreate && (
                    <CreateRoleForm
                        permissions={permissions}
                        onSave={() => { setShowCreate(false); router.reload(); }}
                        onCancel={() => setShowCreate(false)}
                    />
                )}

                <div className="space-y-4">
                    {roles.map(role => (
                        <RoleCard key={role.id} role={role} permissions={permissions} onDelete={handleDelete} />
                    ))}
                    {roles.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                            Belum ada roles yang dibuat.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
