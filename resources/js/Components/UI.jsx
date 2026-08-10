import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown } from 'lucide-react';

export const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
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


export const Select = forwardRef(({ className, error, children, value, onChange, placeholder = "Pilih...", ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [];
    React.Children.forEach(children, child => {
        if (!child) return;
        if (Array.isArray(child)) {
            child.forEach(c => {
                if (c && c.props && c.props.value !== undefined) {
                    options.push({ value: c.props.value, label: c.props.children });
                }
            });
        } else if (child.props && child.props.value !== undefined) {
            options.push({ value: child.props.value, label: child.props.children });
        }
    });

    const selectedOption = options.find(o => String(o.value) === String(value));

    const handleSelect = (val) => {
        if (onChange) {
            onChange({ target: { value: val } });
        }
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            >
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.length === 0 && (
                                <div className="px-3.5 py-2 text-sm text-gray-500">Tidak ada pilihan</div>
                            )}
                            {options.map((opt, i) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center justify-between px-3.5 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-50",
                                            isSelected ? "bg-gray-50 font-medium text-gray-900" : "text-gray-700"
                                        )}
                                        onClick={() => handleSelect(opt.value)}
                                    >
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                                        {isSelected && <Check size={16} className="text-gray-900 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});
Select.displayName = 'Select';

export const Textarea = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
});
Textarea.displayName = 'Textarea';

export const Label = forwardRef(({ className, children, ...props }, ref) => {
    let content = children;
    
    // Automatically make trailing asterisks red for required fields
    if (typeof children === 'string' && children.trim().endsWith('*')) {
        const text = children.trim().slice(0, -1);
        content = (
            <>
                {text} <span className="text-red-500 ml-0.5">*</span>
            </>
        );
    }

    return (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 block mb-1.5",
                className
            )}
            {...props}
        >
            {content}
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
