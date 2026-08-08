import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';

export default function ImportIndex({ default_mapping }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    
    // Step 2: Mapping
    const [jobData, setJobData] = useState(null);
    const [mapping, setMapping] = useState(default_mapping);
    const [importMode, setImportMode] = useState('create_only');
    const [validating, setValidating] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (!selected.name.match(/\.(xlsx|xls)$/)) {
                setError('Hanya file Excel (.xlsx, .xls) yang diperbolehkan.');
                setFile(null);
                return;
            }
            if (selected.size > 10 * 1024 * 1024) {
                setError('Ukuran file maksimal 10MB.');
                setFile(null);
                return;
            }
            setFile(selected);
            setError('');
            setWarning('');
            setJobData(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setUploading(true);
        setError('');
        setWarning('');
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await axios.post('/import/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.warning) {
                setWarning(res.data.warning);
                // Can still proceed
            }
            
            setJobData(res.data);
            
            // Try to auto-map based on headers
            if (res.data.headers) {
                const newMapping = { ...default_mapping };
                setMapping(newMapping);
            }
            
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Terjadi kesalahan saat mengunggah file.');
        } finally {
            setUploading(false);
        }
    };

    const handleMappingChange = (excelHeader, dbField) => {
        setMapping(prev => {
            const newMap = { ...prev };
            if (!dbField) {
                delete newMap[excelHeader];
            } else {
                newMap[excelHeader] = dbField;
            }
            return newMap;
        });
    };

    const handleValidateAndStart = async () => {
        if (!jobData?.job_id) return;
        
        setValidating(true);
        setError('');
        
        try {
            // Validate mapping
            await axios.post(`/import/${jobData.job_id}/validate`, {
                mapping,
                mode: importMode
            });
            
            // If validation passed, redirect to start the import via standard form submission
            // We use router.post here to utilize Inertia
            router.post(`/import/${jobData.job_id}/start`);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal memvalidasi pemetaan kolom.');
            setValidating(false);
        }
    };

    // Database fields available for mapping
    const dbFields = [
        { value: 'asset_code', label: 'Kode Aset (Wajib)' },
        { value: 'asset_name', label: 'Nama Aset (Wajib)' },
        { value: 'quantity', label: 'Jumlah / Qty' },
        { value: 'location', label: 'Lokasi (Teks)' },
        { value: 'acquisition_date', label: 'Tanggal Perolehan' },
        { value: 'depreciation_end_date', label: 'Tanggal Akhir Susut' },
        { value: 'acquisition_value', label: 'Nilai Perolehan' },
        { value: 'previous_accumulated_depreciation', label: 'Akumulasi Susut Sblm' },
        { value: 'accumulated_depreciation', label: 'Akumulasi Susut Total' },
        { value: 'depreciation_per_period', label: 'Nilai Susut / Periode' },
        { value: 'book_value', label: 'Nilai Buku Akhir' },
    ];

    return (
        <AppLayout>
            <Head title="Import Aset" />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Import Aset via Excel</h1>
                        <p className="text-sm text-gray-500">Unggah file Excel untuk menambahkan aset secara massal.</p>
                    </div>
                    <Button variant="secondary" onClick={() => window.location.href = '/import/template'}>
                        <FileSpreadsheet size={16} className="mr-2" />
                        Download Template
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div className="text-sm">{error}</div>
                    </div>
                )}
                
                {warning && (
                    <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div className="text-sm">{warning}</div>
                    </div>
                )}

                {!jobData ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div 
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UploadCloud size={32} />
                            </div>
                            
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {file ? file.name : 'Pilih file Excel atau tarik ke sini'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Mendukung format .xlsx dan .xls (Max: 10MB)'}
                            </p>
                            
                            <Button 
                                type="button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    file ? handleUpload() : fileInputRef.current?.click();
                                }}
                                isLoading={uploading}
                            >
                                {file ? 'Mulai Unggah' : 'Cari File'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <CheckCircle2 size={20} className="text-green-500" />
                                        File Berhasil Diunggah
                                    </h3>
                                    <p className="text-sm text-gray-500">Silakan petakan kolom Excel ke kolom Database.</p>
                                </div>
                                <div className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                                    {jobData.headers?.length || 0} Kolom Terdeteksi
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Pemetaan Kolom (Mapping)</h4>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {jobData.headers?.map((header, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-1/2 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 truncate" title={header}>
                                                    {header}
                                                </div>
                                                <ArrowRight size={16} className="text-gray-400 shrink-0" />
                                                <select
                                                    className="w-1/2 p-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                    value={mapping[header] || ''}
                                                    onChange={(e) => handleMappingChange(header, e.target.value)}
                                                >
                                                    <option value="">-- Abaikan Kolom --</option>
                                                    {dbFields.map(f => (
                                                        <option key={f.value} value={f.value}>{f.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Pengaturan Import</h4>
                                    
                                    <div className="space-y-4 mb-6">
                                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input 
                                                type="radio" 
                                                name="mode" 
                                                value="create_only"
                                                checked={importMode === 'create_only'}
                                                onChange={(e) => setImportMode(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Tambahkan Baru Saja</p>
                                                <p className="text-xs text-gray-500">Aset dengan kode yang sudah ada akan diabaikan.</p>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input 
                                                type="radio" 
                                                name="mode" 
                                                value="update_existing"
                                                checked={importMode === 'update_existing'}
                                                onChange={(e) => setImportMode(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Perbarui Data Saja</p>
                                                <p className="text-xs text-gray-500">Hanya memperbarui aset yang kodenya sudah ada. Baris baru diabaikan.</p>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input 
                                                type="radio" 
                                                name="mode" 
                                                value="upsert"
                                                checked={importMode === 'upsert'}
                                                onChange={(e) => setImportMode(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">Tambahkan & Perbarui (Upsert)</p>
                                                <p className="text-xs text-gray-500">Perbarui jika kode sudah ada, tambahkan baru jika belum.</p>
                                            </div>
                                        </label>
                                    </div>

                                    {jobData.preview && jobData.preview.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Preview Data (Baris 1)</h4>
                                            <div className="bg-gray-50 p-3 rounded-lg border text-xs overflow-x-auto">
                                                <table className="w-full">
                                                    <tbody>
                                                        {Object.entries(jobData.preview[0]).map(([k, v]) => (
                                                            <tr key={k}>
                                                                <td className="py-1 pr-4 font-medium text-gray-600 whitespace-nowrap">{k}</td>
                                                                <td className="py-1 text-gray-900 truncate max-w-[200px]">{v !== null ? String(v) : '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-4 border-t flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setJobData(null)}>
                                    Batal / Unggah Ulang
                                </Button>
                                <Button onClick={handleValidateAndStart} isLoading={validating}>
                                    Proses Import Sekarang
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
