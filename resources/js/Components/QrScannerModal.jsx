import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function QrScannerModal({ isOpen, onClose }) {
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [manualError, setManualError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        setCameraError('');
        setScanning(true);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Kamera tidak didukung oleh browser Anda.');
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }

            // Detect QR code automatically if BarcodeDetector API is supported
            if ('BarcodeDetector' in window) {
                const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                const scanFrame = async () => {
                    if (!videoRef.current || videoRef.current.readyState < 2) {
                        requestAnimationFrame(scanFrame);
                        return;
                    }
                    try {
                        const barcodes = await detector.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            handleQrScanned(barcodes[0].rawValue);
                            return;
                        }
                    } catch { /* ignore frame errors */ }
                    requestAnimationFrame(scanFrame);
                };
                requestAnimationFrame(scanFrame);
            }
        } catch (err) {
            setCameraError(err.message || 'Gagal membuka kamera. Pastikan izin kamera telah diberikan.');
            setScanning(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setScanning(false);
    };

    const handleQrScanned = (qrValue) => {
        if (!qrValue) return;

        try {
            if (navigator.vibrate) navigator.vibrate(100);
        } catch { /* ignore */ }

        stopCamera();
        onClose();

        // Check if QR value is a URL containing /asset/qr/{token} or /assets/{id}
        if (qrValue.includes('/asset/qr/')) {
            const token = qrValue.split('/asset/qr/')[1]?.split('?')[0];
            if (token) {
                router.visit(`/asset/qr/${token}`);
                return;
            }
        }

        if (qrValue.includes('/assets/')) {
            const id = qrValue.split('/assets/')[1]?.split('?')[0];
            if (id && !isNaN(id)) {
                router.visit(`/assets/${id}`);
                return;
            }
        }

        // Default: treat as asset code or token search
        router.visit(`/assets?search=${encodeURIComponent(qrValue.trim())}`);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // If BarcodeDetector is supported, detect from image file
        if ('BarcodeDetector' in window) {
            const img = new Image();
            img.onload = async () => {
                try {
                    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(img);
                    if (barcodes.length > 0) {
                        handleQrScanned(barcodes[0].rawValue);
                    } else {
                        setManualError('QR Code tidak terdeteksi pada gambar ini.');
                    }
                } catch {
                    setManualError('Gagal membaca gambar.');
                }
            };
            img.src = URL.createObjectURL(file);
        } else {
            setManualError('Browser Anda tidak mendukung deteksi gambar otomatis. Silakan masukkan kode aset secara manual.');
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        handleQrScanned(manualCode);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-900 text-white">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-white/10 text-white">
                                    <Camera size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Scan QR Code Aset</h3>
                                    <p className="text-[11px] text-gray-400">Arahkan kamera ke QR Code label aset</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Camera Viewport */}
                        <div className="relative bg-black aspect-square max-h-[300px] flex items-center justify-center overflow-hidden">
                            <video
                                ref={videoRef}
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />

                            {/* Viewfinder Overlay */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-0.5 bg-emerald-400/60 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {cameraError && (
                                <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
                                    <AlertCircle size={36} className="text-amber-400 mb-2" />
                                    <p className="text-sm font-medium">{cameraError}</p>
                                    <button
                                        onClick={startCamera}
                                        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        <RefreshCw size={13} /> Coba Lagi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Controls & Manual Entry */}
                        <div className="p-5 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Upload size={15} />
                                    Upload / Foto Gambar
                                </button>
                            </div>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-gray-100" />
                                <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium">atau ketik kode</span>
                                <div className="flex-grow border-t border-gray-100" />
                            </div>

                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => { setManualCode(e.target.value); setManualError(''); }}
                                    placeholder="Contoh: HA-FF-0001"
                                    className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                                <button
                                    type="submit"
                                    className="h-10 px-4 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                                >
                                    Cari
                                </button>
                            </form>

                            {manualError && (
                                <p className="text-xs text-rose-500 font-medium text-center">{manualError}</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
