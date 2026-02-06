'use client';

import { Theme } from '@/domain/entities/database/theme';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AnnouncementBarProps {
    theme: Theme | null;
}

export function AnnouncementBar({ theme }: AnnouncementBarProps) {
    const params = useParams();
    const lang = params?.lang as string || 'ar';
    const isRTL = lang === 'ar';

    // Countdown state
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!theme?.announcement_countdown_end) return;

        const calculateTimeLeft = () => {
            const endTime = new Date(theme.announcement_countdown_end!).getTime();
            const now = new Date().getTime();
            const difference = endTime - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [theme?.announcement_countdown_end]);

    // Don't show if no theme, announcement disabled, or countdown expired
    if (!theme?.show_announcement || isExpired) return null;

    const text = isRTL
        ? (theme.announcement_text_ar || theme.announcement_text)
        : (theme.announcement_text || theme.announcement_text_ar);

    if (!text) return null;

    const bgColor = theme.announcement_bg_color || '#E91E63';
    const textColor = theme.announcement_text_color || '#FFFFFF';

    // Speed mapping (seconds for full animation)
    const speedMap = {
        slow: 40,
        medium: 25,
        fast: 12,
    };
    const animationDuration = speedMap[theme.announcement_scroll_speed || 'medium'];

    // Format countdown with labels
    const formatNumber = (n: number) => n.toString().padStart(2, '0');

    return (
        <div
            className="fixed bottom-0 left-0 right-0 w-full py-2 md:py-3 overflow-hidden z-[90] flex items-center"
            style={{
                backgroundColor: bgColor,
                color: textColor
            }}
        >
            {/* Countdown Timer - Compact on Mobile */}
            {timeLeft && (
                <div className="flex-shrink-0 flex items-center gap-0.5 md:gap-1 px-2 md:px-3 mx-1 md:mx-2 bg-black/30 rounded-lg backdrop-blur-sm">
                    {/* Countdown Label */}
                    <div className="hidden sm:flex flex-col items-center px-1 md:px-2 py-1">
                        <span className="text-[8px] md:text-[10px] uppercase tracking-wider opacity-80">
                            {isRTL ? 'ينتهي في' : 'Ends In'}
                        </span>
                    </div>

                    {/* Mobile: Just show icon */}
                    <span className="sm:hidden text-sm">⏱️</span>

                    {/* Days - Hide on very small screens if 0 */}
                    {timeLeft.days > 0 && (
                        <>
                            <div className="flex flex-col items-center px-1 md:px-2 py-0.5 md:py-1 bg-white/10 rounded">
                                <span className="text-sm md:text-xl font-bold tabular-nums">{formatNumber(timeLeft.days)}</span>
                                <span className="text-[8px] md:text-[10px] uppercase opacity-80">{isRTL ? 'ي' : 'D'}</span>
                            </div>
                            <span className="text-sm md:text-xl font-bold opacity-50">:</span>
                        </>
                    )}

                    {/* Hours */}
                    <div className="flex flex-col items-center px-1 md:px-2 py-0.5 md:py-1 bg-white/10 rounded">
                        <span className="text-sm md:text-xl font-bold tabular-nums">{formatNumber(timeLeft.hours)}</span>
                        <span className="text-[8px] md:text-[10px] uppercase opacity-80">{isRTL ? 'س' : 'H'}</span>
                    </div>

                    <span className="text-sm md:text-xl font-bold opacity-50">:</span>

                    {/* Minutes */}
                    <div className="flex flex-col items-center px-1 md:px-2 py-0.5 md:py-1 bg-white/10 rounded">
                        <span className="text-sm md:text-xl font-bold tabular-nums">{formatNumber(timeLeft.minutes)}</span>
                        <span className="text-[8px] md:text-[10px] uppercase opacity-80">{isRTL ? 'د' : 'M'}</span>
                    </div>

                    <span className="text-sm md:text-xl font-bold opacity-50">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center px-1 md:px-2 py-0.5 md:py-1 bg-white/10 rounded">
                        <span className="text-sm md:text-xl font-bold tabular-nums animate-pulse">{formatNumber(timeLeft.seconds)}</span>
                        <span className="text-[8px] md:text-[10px] uppercase opacity-80">{isRTL ? 'ث' : 'S'}</span>
                    </div>
                </div>
            )}

            {/* Scrolling Text */}
            <div className="flex-1 overflow-hidden">
                <div
                    className="flex whitespace-nowrap text-sm md:text-base font-semibold"
                    style={{
                        animation: isRTL
                            ? `scroll-rtl ${animationDuration}s linear infinite`
                            : `scroll-ltr ${animationDuration}s linear infinite`,
                    }}
                >
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                    <span className="px-4">{text}</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll-rtl {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                }
                @keyframes scroll-ltr {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
