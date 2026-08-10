const fs = require('fs');
const uiFile = 'C:\\Develop\\auditassetweb\\resources\\js\\Components\\UI.jsx';
let content = fs.readFileSync(uiFile, 'utf8');

// Update imports
if (!content.includes('useState')) {
    content = content.replace("import React, { forwardRef, useEffect } from 'react';", "import React, { forwardRef, useEffect, useState, useRef } from 'react';");
}
content = content.replace("import { X } from 'lucide-react';", "import { X, Check, ChevronDown } from 'lucide-react';");

// Replace Select component
const newSelect = `export const Select = forwardRef(({ className, error, children, value, onChange, placeholder = "Pilih...", ...props }, ref) => {
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
Select.displayName = 'Select';`;

content = content.replace(/export const Select = forwardRef\(\(\{[\s\S]*?Select\.displayName = 'Select';/, newSelect);

fs.writeFileSync(uiFile, content);
console.log('UI.jsx Select component modernized.');
