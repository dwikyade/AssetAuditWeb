import { useState, useEffect } from 'react';
import { Modal, Button } from './UI';

let resolveCallback = null;

export const confirmUI = (message, title = 'Konfirmasi Tindakan') => {
    return new Promise((resolve) => {
        resolveCallback = resolve;
        window.dispatchEvent(new CustomEvent('open-confirm', { detail: { message, title } }));
    });
};

// Expose globally for easier refactoring
window.confirmUI = confirmUI;

export function ConfirmDialogProvider() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({ message: '', title: '' });

    useEffect(() => {
        const handleOpen = (e) => {
            setConfig(e.detail);
            setIsOpen(true);
        };
        window.addEventListener('open-confirm', handleOpen);
        return () => window.removeEventListener('open-confirm', handleOpen);
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolveCallback) resolveCallback(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolveCallback) resolveCallback(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} title={config.title} maxWidth="max-w-sm">
            <div className="py-2">
                <p className="text-gray-600 text-sm leading-relaxed">{config.message}</p>
            </div>
            <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={handleCancel}>Batal</Button>
                <Button onClick={handleConfirm}>Ya, Lanjutkan</Button>
            </div>
        </Modal>
    );
}
