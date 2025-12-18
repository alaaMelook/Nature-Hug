import React from 'react';

interface SpinnerProps {
    className?: string; // Wrapper className
    size?: 'sm' | 'md' | 'lg';
    color?: string; // tailwind text color class, e.g. 'text-white'
}

export function Spinner({ className = '', size = 'md', color = 'text-current' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
            <div className={`absolute inset-0 rounded-full border-gray-200/20 ${size === 'sm' ? 'border-2' : 'border-4'}`}></div>
            <div className={`absolute inset-0 rounded-full border-t-transparent animate-spin ${color} ${size === 'sm' ? 'border-2' : 'border-4'}`}></div>
        </div>
    );
}
