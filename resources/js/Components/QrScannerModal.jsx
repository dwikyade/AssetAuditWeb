import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, AlertCircle, RefreshCw, QrCode } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function QrScannerModal({ isOpen, onClose }) {
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [manualError, setManualError] = useState('');
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);
    const animFrameRef = useRef(null);

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

            let mediaStream = null;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' } }
                });
            } catch {
                // Fallback for devices without 'exact' facingMode or desktop webcams
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
            }

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.setAttribute('autoplay', 'true');
                videoRef.current.setAttribute('muted', 'true');
                await videoRef.current.play().catch(() => {});
            }

            // Detect QR code automatically if BarcodeDetector API is supported natively
            if ('BarcodeDetector' in window) {
                const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                const scanFrame = async () => {
                    if (videoRef.current && videoRef.current.readyState >= 2) {
                        try {
                            const barcodes = await detector.detect(videoRef.current);
                            if (barcodes.length > 0 && barcodes[0].rawValue) {
                                handleQrScanned(barcodes[0].rawValue);
                                return;
                            }
                        } catch { /* ignore frame error */ }
                    }
                    animFrameRef.current = requestAnimationFrame(scanFrame);
                };
                animFrameRef.current = requestAnimationFrame(scanFrame);
            }
        } catch (err) {
            setCameraError(err.message || 'Gagal membuka kamera. Pastikan izin kamera telah diberikan.');
            setScanning(false);
        }
    };

    const stopCamera = () => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
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

        const cleanVal = qrValue.trim();

        if (cleanVal.includes('/asset/qr/')) {
            const token = cleanVal.split('/asset/qr/')[1]?.split('?')[0];
            if (token) {
                router.visit(`/asset/qr/${token}`);
                return;
            }
        }

        if (cleanVal.includes('/assets/')) {
            const id = cleanVal.split('/assets/')[1]?.split('?')[0];
            if (id && !isNaN(id)) {
                router.visit(`/assets/${id}`);
                return;
            }
        }

        router.visit(`/assets?search=${encodeURIComponent(cleanVal)}`);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if ('BarcodeDetector' in window) {
            const img = new Image();
            img.onload = async () => {
                try {
                    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(img);
                    if (barcodes.length > 0 && barcodes[0].rawValue) {
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
            setManualError('Browser Anda tidak mendukung deteksi otomatis gambar. Silakan masukkan kode aset secara manual.');
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto"
                    >
                        {/* Header - Centered & Clean */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-900 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-white shrink-0">
                                    <Camera size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm leading-tight text-white">Scan QR Code Aset</h3>
                                    <p className="text-[11px] text-gray-400 leading-tight truncate">Arahkan kamera ke QR Code label aset</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Viewport & Camera Frame - Perfectly Centered */}
                        <div className="relative bg-black w-full h-[260px] sm:h-[300px] flex items-center justify-center overflow-hidden">
                            <video
                                ref={videoRef}
                                playsInline
                                autoPlay
                                muted
                                className="w-full h-full object-cover"
                            />

                            {/* Viewfinder Target Box - Perfectly Centered Overlay */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="w-44 h-44 sm:w-52 sm:h-52 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex items-center justify-center">
                                    <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                                    <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                                    {/* Scanning Laser Line */}
                                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                                </div>
                            </div>

                            {cameraError && (
                                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center text-white">
                                    <AlertCircle size={36} className="text-amber-400 mb-2" />
                                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{cameraError}</p>
                                    <button
                                        onClick={startCamera}
                                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl transition-colors"
                                    >
                                        <RefreshCw size={13} /> Coba Kamera Lagi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Controls & Manual Entry Section */}
                        <div className="p-4 sm:p-5 space-y-3.5 bg-white">
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
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    <Upload size={14} className="text-gray-500" />
                                    Upload / Capture Foto QR
                                </button>
                            </div>

                            <div className="relative flex items-center py-1">
                                <div className="flex-grow border-t border-gray-100" />
                                <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">atau masukkan kode</span>
                                <div className="flex-grow border-t border-gray-100" />
                            </div>

                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => { setManualCode(e.target.value); setManualError(''); }}
                                    placeholder="Contoh: HA-FF-0001"
                                    className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="h-10 px-4 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm shrink-0 active:scale-[0.98]"
                                >
                                    Cari Aset
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
