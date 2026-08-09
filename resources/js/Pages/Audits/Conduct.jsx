import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button, Input, Label } from '@/Components/UI';
import { 
    Search, QrCode, ArrowLeft, CheckCircle2, 
    XCircle, AlertTriangle, Save, Loader2 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function AuditConduct({ session, conditions, locations, audited_ids, total_scope, audited_count }) {
    const [searchCode, setSearchCode] = useState('');
    const [searching, setSearching] = useState(false);
    const [asset, setAsset] = useState(null);
    const [searchError, setSearchError] = useState('');
    
    // Status if asset is already audited in this session
    const isAlreadyAudited = asset && audited_ids.includes(asset.id);
    
    const searchInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        asset_id: '',
        found_status: 'found',
        condition_id: '',
        location_id: '',
        quantity_found: '',
        result: 'match',
        verification_method: 'manual',
        notes: '',
    });

    const searchAsset = async (e) => {
        if (e) e.preventDefault();
        if (!searchCode.trim()) return;
        
        setSearching(true);
        setSearchError('');
        setAsset(null);
        reset();
        
        try {
            const res = await axios.get(`/api/assets/lookup?code=${encodeURIComponent(searchCode)}`);
            const foundAsset = res.data;
            setAsset(foundAsset);
            
            // Pre-fill form
            setData({
                asset_id: foundAsset.id,
                found_status: 'found',
                condition_id: foundAsset.condition_id || '',
                location_id: foundAsset.location_id || '',
                quantity_found: foundAsset.quantity || 1,
                result: 'match', // Default assume match if everything looks good
                verification_method: searchCode.length > 8 ? 'qr_scan' : 'manual', // Simple heuristic
                notes: '',
            });
            
        } catch (err) {
            setSearchError(err.response?.data?.error || 'Aset tidak ditemukan dengan kode tersebut.');
        } finally {
            setSearching(false);
        }
    };

    // Auto focus search input on load
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Intelligent result logic
    useEffect(() => {
        if (!asset) return;
        
        if (data.found_status === 'not_found') {
            setData('result', 'issue');
            return;
        }
        
        if (data.found_status === 'partially_found') {
            setData('result', 'mismatch');
            return;
        }
        
        // If found, check if condition changed from normal to broken, etc.
        // Or if location changed
        const locationChanged = asset.location_id && data.location_id && asset.location_id != data.location_id;
        const conditionChanged = asset.condition_id && data.condition_id && asset.condition_id != data.condition_id;
        
        if (locationChanged || conditionChanged) {
            setData('result', 'mismatch');
        } else {
            setData('result', 'match');
        }
        
    }, [data.found_status, data.location_id, data.condition_id, asset]);

    const submitAudit = (e) => {
        e.preventDefault();
        post(`/audit-sessions/${session.id}/audits`, {
            onSuccess: () => {
                setAsset(null);
                setSearchCode('');
                reset();
                searchInputRef.current?.focus();
                
                // If the user submits, inertia will reload the page and update the `audited_count` prop.
            }
        });
    };

    const progress = total_scope > 0 ? Math.round((audited_count / total_scope) * 100) : 0;

    return (
        <AppLayout>
            <Head title={`Conduct Audit: ${session.name}`} />
            
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
                {/* Header & Progress */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => router.get(`/audit-sessions/${session.id}`)}>
                                <ArrowLeft size={18} />
                            </Button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{session.name}</h1>
                                <p className="text-sm text-gray-500">Kode Sesi: {session.code}</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-100 flex items-center justify-between gap-4">
                            <span>Progres Audit</span>
                            <span className="text-lg font-bold">{audited_count} / {total_scope}</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Search / Scan Box */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <form onSubmit={searchAsset} className="flex gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <QrCode size={18} className="text-gray-400" />
                            </div>
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Scan QR Code atau ketik kode aset..."
                                className="pl-10 py-6 text-lg w-full bg-gray-50 focus:bg-white"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <Button type="submit" size="lg" className="h-auto" isLoading={searching}>
                            <Search size={20} className="md:mr-2" />
                            <span className="hidden md:inline">Cari Aset</span>
                        </Button>
                    </form>
                    
                    {searchError && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                            <AlertTriangle size={16} />
                            {searchError}
                        </div>
                    )}
                </div>

                {/* Asset Detail & Audit Form */}
                {asset && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {isAlreadyAudited && (
                            <div className="bg-amber-50 p-4 border-b border-amber-200 flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-bold text-amber-800">Aset Sudah Diaudit</h4>
                                    <p className="text-sm text-amber-700">Aset ini sudah pernah diaudit pada sesi ini. Menyimpan data baru akan menimpa data audit sebelumnya.</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 md:p-8">
                            {/* Asset Info Card */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                    <QrCode size={32} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{asset.asset_name}</h2>
                                    <p className="text-sm font-mono text-indigo-600 font-medium mb-3">{asset.asset_code}</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Kategori</p>
                                            <p className="font-medium text-gray-900">{asset.category?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Departemen</p>
                                            <p className="font-medium text-gray-900">{asset.department?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Lokasi Sistem</p>
                                            <p className="font-medium text-gray-900">{asset.location?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Kondisi Sistem</p>
                                            <p className="font-medium" style={{ color: asset.condition?.color }}>{asset.condition?.name || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Form */}
                            <form onSubmit={submitAudit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Status Fisik */}
                                    <div className="md:col-span-3">
                                        <Label className="text-base">Status Fisik Aset *</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                            <label className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${data.found_status === 'found' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200'}`}>
                                                <input type="radio" name="found_status" value="found" className="sr-only" checked={data.found_status === 'found'} onChange={(e) => setData('found_status', e.target.value)} />
                                                <CheckCircle2 size={24} className={data.found_status === 'found' ? 'text-green-500' : 'text-gray-400'} />
                                                <span className="font-medium">Ditemukan Utuh</span>
                                            </label>
                                            <label className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${data.found_status === 'partially_found' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-200'}`}>
                                                <input type="radio" name="found_status" value="partially_found" className="sr-only" checked={data.found_status === 'partially_found'} onChange={(e) => setData('found_status', e.target.value)} />
                                                <AlertTriangle size={24} className={data.found_status === 'partially_found' ? 'text-amber-500' : 'text-gray-400'} />
                                                <span className="font-medium">Ditemukan Sebagian</span>
                                            </label>
                                            <label className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${data.found_status === 'not_found' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-200'}`}>
                                                <input type="radio" name="found_status" value="not_found" className="sr-only" checked={data.found_status === 'not_found'} onChange={(e) => setData('found_status', e.target.value)} />
                                                <XCircle size={24} className={data.found_status === 'not_found' ? 'text-red-500' : 'text-gray-400'} />
                                                <span className="font-medium">Tidak Ditemukan</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Jika ditemukan, tampilkan opsi pembaruan */}
                                    {data.found_status !== 'not_found' && (
                                        <>
                                            <div>
                                                <Label>Kondisi Fisik Saat Ini *</Label>
                                                <select
                                                    value={data.condition_id}
                                                    onChange={(e) => setData('condition_id', e.target.value)}
                                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500"
                                                    required
                                                >
                                                    <option value="">-- Pilih Kondisi --</option>
                                                    {conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Lokasi Aktual Ditemukan *</Label>
                                                <select
                                                    value={data.location_id}
                                                    onChange={(e) => setData('location_id', e.target.value)}
                                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500"
                                                    required
                                                >
                                                    <option value="">-- Pilih Lokasi --</option>
                                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Jumlah/Qty Aktual *</Label>
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    className="mt-1"
                                                    value={data.quantity_found}
                                                    onChange={(e) => setData('quantity_found', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="md:col-span-3 border-t pt-4">
                                        <Label>Catatan Auditor</Label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 min-h-[100px]"
                                            placeholder="Tambahkan catatan jika ada perbedaan data, kerusakan fisik, atau informasi penting lainnya..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-500">Hasil Sistem:</span>
                                        <span className={`font-bold ${data.result === 'match' ? 'text-green-600' : (data.result === 'mismatch' ? 'text-amber-600' : 'text-red-600')}`}>
                                            {data.result === 'match' ? 'MATCH (Sesuai)' : (data.result === 'mismatch' ? 'MISMATCH (Beda Data)' : 'ISSUE (Ada Masalah)')}
                                        </span>
                                    </div>
                                    <Button type="submit" size="lg" isLoading={processing}>
                                        {!processing && <Save size={18} className="mr-2" />}
                                        Simpan Hasil Audit
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
