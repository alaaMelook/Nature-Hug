'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from './TranslationProvider';
import type { LucideIcon } from 'lucide-react';

type CollapsibleSectionProps = {
    id: string;
    title: string;
    content: string | any;
    icon?: LucideIcon;
    isOpen: boolean;
    onToggle: (id: string) => void;
};

export const CollapsibleSection = ({
    id,
    title,
    content,
    icon: Icon,
    isOpen,
    onToggle,
}: CollapsibleSectionProps) => {
    const { t } = useTranslation();

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-semibold text-sm text-primary-800 hover:bg-primary-50 transition duration-150"
                onClick={() => onToggle(id)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={20} className="text-primary-600" />}
                    <span>{t(title)}</span>
                </div>

                {isOpen ? (
                    <ChevronUp
                        size={20}
                        className="text-primary-600 transition-transform duration-300"
                    />
                ) : (
                    <ChevronDown
                        size={20}
                        className="text-primary-600 transition-transform duration-300"
                    />
                )}
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 p-4 pt-0' : 'max-h-0 opacity-0'
                    }`}
                aria-hidden={!isOpen}
            >
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {typeof content === 'string' ? <p>{t(content)}</p> : content}
                </div>
            </div>
        </div>
    );
};
