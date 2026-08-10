import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { CheckCircle, XCircle, Loader2, AlertTriangle, ArrowLeft, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ImportShow({ job }) {
    const [progressData, setProgressData] = useState({
        status: job.status,
        total_rows: job.total_rows || 0,
        processed_rows: job.processed_rows || 0,
        progress_percent: job.progress_percent || 0,
        created_rows: job.created_rows || 0,
        updated_rows: job.updated_rows || 0,
        error_rows: job.error_rows || 0,
        skipped_rows: job.skipped_rows || 0,
    });
    
    // Polling mechanism for progress
    useEffect(() => {
        let interval;
        
        if (progressData.status === 'pending' || progressData.status === 'queued' || progressData.status === 'processing') {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`/import/${job.id}/progress`);
                    setProgressData(res.data);
                    
                    if (res.data.status === 'completed' || res.data.status === 'completed_with_errors' || res.data.status === 'failed') {
                        clearInterval(interval);
                        // Refresh page to load errors if any
                        if (res.data.status === 'completed_with_errors') {
                            window.location.reload();
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch progress', err);
                }
            }, 2000); // Poll every 2 seconds
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [progressData.status, job.id]);

    const isRunning = progressData.status === 'queued' || progressData.status === 'processing';
    const isFinished = progressData.status === 'completed' || progressData.status === 'completed_with_errors' || progressData.status === 'failed';

    return (
        <AppLayout>
            <Head title="Proses Import" />
            
            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.location.href = '/import'}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Proses Import</h1>
                        <p className="text-sm text-gray-500">{job.file_name} (Mode: {job.mode})</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 text-center border-b border-gray-100">
                        {progressData.status === 'queued' && (
                            <div className="flex flex-col items-center">
                                <Loader2 size={48} className="text-gray-900 animate-spin mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">Menunggu Antrean...</h2>
                                <p className="text-gray-500">File Anda sedang dalam antrean dan akan segera diproses.</p>
                            </div>
                        )}
                        
                        {progressData.status === 'processing' && (
                            <div className="flex flex-col items-center">
                                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">Sedang Memproses...</h2>
                                <p className="text-gray-500">Mohon jangan tutup halaman ini meskipun proses berjalan di latar belakang.</p>
                            </div>
                        )}
                        
                        {progressData.status === 'completed' && (
                            <div className="flex flex-col items-center">
                                <CheckCircle size={56} className="text-green-500 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">Import Selesai!</h2>
                                <p className="text-gray-500">Semua baris berhasil diimpor tanpa kesalahan.</p>
                            </div>
                        )}
                        
                        {progressData.status === 'completed_with_errors' && (
                            <div className="flex flex-col items-center">
                                <AlertTriangle size={56} className="text-amber-500 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">Selesai dengan Peringatan</h2>
                                <p className="text-gray-500">Sebagian data berhasil diimpor, namun terdapat beberapa baris yang gagal atau dilewati.</p>
                            </div>
                        )}
                        
                        {progressData.status === 'failed' && (
                            <div className="flex flex-col items-center">
                                <XCircle size={56} className="text-red-500 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">Import Gagal</h2>
                                <p className="text-red-500">{job.error_message || 'Terjadi kesalahan sistem yang tidak terduga.'}</p>
                            </div>
                        )}

                        <div className="mt-8 max-w-lg mx-auto">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">Progres Keseluruhan</span>
                                <span className="text-black font-bold">{progressData.progress_percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                                <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${progressData.status === 'failed' ? 'bg-red-500' : 'bg-black'}`} 
                                    style={{ width: `${progressData.progress_percent}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                                {progressData.processed_rows} dari {progressData.total_rows} baris diproses
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Berhasil Ditambah</p>
                            <p className="text-2xl font-bold text-green-600">{progressData.created_rows}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Berhasil Diperbarui</p>
                            <p className="text-2xl font-bold text-blue-600">{progressData.updated_rows}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Dilewati (Skipped)</p>
                            <p className="text-2xl font-bold text-gray-600">{progressData.skipped_rows}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Gagal (Error)</p>
                            <p className="text-2xl font-bold text-red-600">{progressData.error_rows}</p>
                        </div>
                    </div>
                </div>

                {isFinished && job.errors && job.errors.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                        <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
                            <h3 className="font-bold text-red-800 flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Detail Error ({job.errors.length} baris pertama)
                            </h3>
                            <Button variant="secondary" onClick={() => window.location.href = `/import/${job.id}/errors`} size="sm" className="bg-white text-red-700 hover:bg-red-50 border-red-200">
                                <Download size={14} className="mr-2" />
                                Unduh Log Error
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-red-50/50 text-red-700">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Baris Ke-</th>
                                        <th className="px-6 py-3 font-medium">Kode Aset</th>
                                        <th className="px-6 py-3 font-medium">Pesan Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-100">
                                    {job.errors.map((err, i) => (
                                        <tr key={i} className="hover:bg-red-50/50 transition-colors text-gray-700">
                                            <td className="px-6 py-2">{err.row_number}</td>
                                            <td className="px-6 py-2 font-mono text-xs">{err.asset_code || '-'}</td>
                                            <td className="px-6 py-2 whitespace-normal break-words max-w-md text-red-600">{err.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
