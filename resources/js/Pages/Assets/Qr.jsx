import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, Printer, RefreshCw, AlertCircle, Scan } from 'lucide-react';
import { useRef } from 'react';

export default function Qr({ asset, qr_svg, qr_url }) {
    const printRef = useRef(null);

    const handlePrint = () => {
        const content = printRef.current;
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code - ${asset.asset_code}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: white; }
                        .ticket { border: 2px solid #000; padding: 20px; text-align: center; width: 300px; border-radius: 8px; }
                        .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                        .code { font-size: 14px; margin-bottom: 15px; font-family: monospace; }
                        .qr-container svg { width: 100%; height: auto; max-width: 250px; }
                        .footer { font-size: 10px; margin-top: 15px; color: #555; }
                        @media print {
                            @page { margin: 0; }
                            body { height: auto; display: block; padding: 20px; }
                            .ticket { width: auto; max-width: 300px; margin: 0 auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="title">${asset.asset_name}</div>
                        <div class="code">${asset.asset_code}</div>
                        <div class="qr-container">
                            ${qr_svg}
                        </div>
                        <div class="footer">Scan untuk melihat detail aset</div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleRegenerate = () => {
        if (confirm('Regenerate akan membuat QR code lama menjadi tidak valid (jika dicetak, harus cetak ulang). Lanjutkan?')) {
            router.post(`/assets/${asset.id}/qr/regenerate`);
        }
    };

    return (
        <AppLayout>
            <Head title={`QR Code: ${asset.asset_code}`} />

            <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/assets/${asset.id}`)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">QR Code Aset</h1>
                        <p className="text-sm font-mono text-black">{asset.asset_code}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* QR Preview Area */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <div 
                            ref={printRef}
                            className="bg-white p-4 border-2 border-gray-100 rounded-2xl shadow-sm mb-6 text-center"
                        >
                            <p className="font-bold text-gray-900 text-lg mb-1">{asset.asset_name}</p>
                            <p className="font-mono text-gray-500 text-sm mb-4">{asset.asset_code}</p>
                            <div 
                                className="w-64 h-64 mx-auto bg-white [&>svg]:w-full [&>svg]:h-full" 
                                dangerouslySetInnerHTML={{ __html: qr_svg }} 
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <Button onClick={handlePrint} className="w-full sm:w-auto">
                                <Printer size={16} className="mr-2" />
                                Cetak Label
                            </Button>
                        </div>
                    </div>

                    {/* QR Details & Actions */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Scan size={18} className="text-black" />
                                Informasi Tautan
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">URL Publik QR Code</p>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono text-gray-600 break-all">
                                        {qr_url}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        URL ini aman. Jika di-scan oleh orang tanpa akses login, mereka hanya akan melihat status dasar (tanpa data finansial).
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="font-medium text-sm text-gray-800 mb-2">Detail Identitas</h4>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        <div>
                                            <dt className="text-gray-500 text-xs">Kategori</dt>
                                            <dd className="font-medium text-gray-900">{asset.category?.name || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500 text-xs">Departemen</dt>
                                            <dd className="font-medium text-gray-900">{asset.department?.name || '-'}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-gray-500 text-xs">Lokasi Default</dt>
                                            <dd className="font-medium text-gray-900">{asset.location?.name || '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                            <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Keamanan Token QR
                            </h3>
                            <p className="text-sm text-red-700 mb-4">
                                Jika label QR code aset ini hilang atau diduga disalahgunakan, Anda dapat me-regenerate (memperbarui) token QR. 
                                <strong>Peringatan:</strong> Ini akan membuat semua label QR yang sudah dicetak sebelumnya menjadi tidak valid dan tidak bisa di-scan lagi.
                            </p>
                            <Button variant="ghost" onClick={handleRegenerate} className="bg-white text-red-600 border border-red-200 hover:bg-red-100 w-full justify-center">
                                <RefreshCw size={16} className="mr-2" />
                                Regenerate QR Code
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
