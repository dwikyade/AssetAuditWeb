import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI';
import { ArrowLeft, QrCode, RefreshCw, Download, Printer } from 'lucide-react';

export default function AssetQr({ asset, qr_svg, qr_url }) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${asset.asset_code}</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                    .container { text-align: center; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; max-width: 320px; }
                    h1 { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 4px; }
                    p { font-size: 0.75rem; color: #6b7280; margin: 0 0 16px 0; }
                    .code { font-size: 1.25rem; font-weight: 800; color: #111827; font-family: monospace; margin-top: 16px; letter-spacing: 0.05em; }
                    svg { max-width: 100%; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${asset.name}</h1>
                    <p>${asset.category?.name ?? ''} &bull; ${asset.location?.name ?? ''}</p>
                    ${qr_svg}
                    <div class="code">${asset.asset_code}</div>
                </div>
                <script>window.onload = () => { window.print(); window.close(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadSvg = () => {
        const blob = new Blob([qr_svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${asset.asset_code}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRegenerate = () => {
        if (window.confirmUI) {
            window.confirmUI(`Regenerate QR Code untuk aset "${asset.asset_code}"? QR code lama akan tidak valid.`).then(ok => {
            if (ok) router.post(`/assets/${asset.id}/qr/regenerate`);
            });
        } else if (confirm(`Regenerate QR Code? QR code lama akan tidak valid.`)) {
            router.post(`/assets/${asset.id}/qr/regenerate`);
        }
    };

    return (
        <AppLayout>
            <Head title={`QR Code - ${asset.asset_code}`} />
            <div className="p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.visit(`/assets/${asset.id}`)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">QR Code Aset</h1>
                        <p className="text-sm text-gray-500">Scan untuk melihat detail aset secara langsung</p>
                    </div>
                </div>

                {/* QR Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center gap-6">

                    {/* Asset Info */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-3">
                            <QrCode size={14} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">Asset QR Code</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{asset.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {asset.category?.name && <span>{asset.category.name}</span>}
                            {asset.category?.name && asset.location?.name && <span className="mx-1.5">·</span>}
                            {asset.location?.name && <span>{asset.location.name}</span>}
                        </p>
                    </div>

                    {/* QR Code SVG */}
                    <div className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-inner">
                        <div
                            className="w-64 h-64"
                            dangerouslySetInnerHTML={{ __html: qr_svg }}
                        />
                    </div>

                    {/* Asset Code Badge */}
                    <div className="font-mono font-bold text-2xl tracking-widest text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 letter-spacing-wider">
                        {asset.asset_code}
                    </div>

                    {/* QR URL */}
                    <div className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">URL Redirect</p>
                        <p className="text-xs text-gray-700 font-mono break-all">{qr_url}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button className="w-full" onClick={handlePrint}>
                        <Printer size={16} className="mr-2" />
                        Cetak QR Code
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={handleDownloadSvg}>
                        <Download size={16} className="mr-2" />
                        Unduh SVG
                    </Button>
                    <Button variant="danger" className="w-full" onClick={handleRegenerate}>
                        <RefreshCw size={16} className="mr-2" />
                        Regenerate QR
                    </Button>
                </div>

                {/* Warning note */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    <strong>Perhatian:</strong> Jika Anda melakukan <em>Regenerate QR</em>, QR code yang lama (sudah dicetak) tidak akan berfungsi lagi. Pastikan untuk mencetak/mengunduh QR code yang baru setelah regenerate.
                </div>
            </div>
        </AppLayout>
    );
}
