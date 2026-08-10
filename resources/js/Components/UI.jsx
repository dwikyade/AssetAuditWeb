import React, { forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full rounded-sm border border-gray-300 bg-white px-2.5 py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
});
Input.displayName = 'Input';

export const Label = forwardRef(({ className, children, ...props }, ref) => {
    return (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 block mb-1.5",
                className
            )}
            {...props}
        >
            {children}
        </label>
    );
});
Label.displayName = 'Label';

export const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black shadow-sm',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    };
    
    const sizes = {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-10 px-5 text-base',
        icon: 'h-9 w-9 justify-center p-0',
    };

    return (
        <button
            ref={ref}
            disabled={isLoading || props.disabled}
            className={cn(
                "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
});
Button.displayName = 'Button';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                        className={cn("bg-white w-full rounded-xl shadow-xl border border-gray-200 z-10 flex flex-col max-h-[90vh] overflow-hidden", maxWidth)}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
