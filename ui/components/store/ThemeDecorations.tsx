"use client";

import { Theme } from "@/domain/entities/database/theme";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface ThemeDecorationsProps {
    theme: Theme | null;
}

// Floating Hearts for Valentine's Day
function FloatingHearts({ color }: { color: string }) {
    const hearts = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 8 + Math.random() * 4,
            size: 16 + Math.random() * 20,
            opacity: 0.3 + Math.random() * 0.4,
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute"
                    style={{
                        left: `${heart.left}%`,
                        top: '-50px',
                        fontSize: heart.size,
                        opacity: heart.opacity,
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, Math.sin(heart.id) * 30],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: heart.duration,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: 'linear',
                    }}
                >
                    <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
}

// Floating Crescent Moon and Stars for Ramadan
function FloatingCrescentStars({ color }: { color: string }) {
    const items = useMemo(() =>
        Array.from({ length: 18 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 6,
            duration: 10 + Math.random() * 6,
            size: 20 + Math.random() * 25,
            opacity: 0.5 + Math.random() * 0.4,
            type: i % 4 === 0 ? 'crescent' : 'star', // Mix of crescents and stars
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    className="absolute"
                    style={{
                        left: `${item.left}%`,
                        top: '-60px',
                        fontSize: item.size,
                        opacity: item.opacity,
                    }}
                    animate={{
                        y: ['0vh', '115vh'],
                        x: [0, Math.sin(item.id * 0.5) * 25],
                        rotate: item.type === 'star' ? [0, 360] : [-10, 10, -10],
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: 'linear',
                    }}
                >
                    {item.type === 'crescent' ? (
                        // Crescent Moon
                        <svg width="1em" height="1em" viewBox="0 0 40 40" fill="none">
                            <path
                                d="M28 5C16.954 5 8 13.954 8 25s8.954 20 20 20c2.5 0 4.9-.46 7.1-1.3C26.5 41.2 20 34.1 20 25s6.5-16.2 15.1-18.7C32.9 5.46 30.5 5 28 5z"
                                fill={color}
                            />
                            {/* Glow effect */}
                            <path
                                d="M28 5C16.954 5 8 13.954 8 25s8.954 20 20 20c2.5 0 4.9-.46 7.1-1.3C26.5 41.2 20 34.1 20 25s6.5-16.2 15.1-18.7C32.9 5.46 30.5 5 28 5z"
                                fill="white"
                                fillOpacity="0.3"
                            />
                        </svg>
                    ) : (
                        // Star
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill={color}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            {/* Inner glow */}
                            <path
                                d="M12 5l2 4.1 4.5.65-3.25 3.17.77 4.48L12 15.2l-4.02 2.2.77-4.48-3.25-3.17 4.5-.65L12 5z"
                                fill="white"
                                fillOpacity="0.4"
                            />
                        </svg>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// Floating Balloons for Eid
function FloatingBalloons({ color }: { color: string }) {
    const balloons = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 4,
            duration: 15 + Math.random() * 8,
            size: 30 + Math.random() * 25,
            opacity: 0.5 + Math.random() * 0.3,
            color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB'][i % 5],
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
            {balloons.map((balloon) => (
                <motion.div
                    key={balloon.id}
                    className="absolute"
                    style={{
                        left: `${balloon.left}%`,
                        bottom: '-100px',
                        fontSize: balloon.size,
                        opacity: balloon.opacity,
                    }}
                    animate={{
                        y: [0, '-120vh'],
                        x: [0, Math.sin(balloon.id) * 40, 0],
                    }}
                    transition={{
                        duration: balloon.duration,
                        repeat: Infinity,
                        delay: balloon.delay,
                        ease: 'easeOut',
                    }}
                >
                    {/* Balloon SVG */}
                    <svg width="1em" height="1.3em" viewBox="0 0 30 40" fill="none">
                        {/* Balloon body */}
                        <ellipse cx="15" cy="14" rx="13" ry="14" fill={balloon.color} />
                        {/* Shine */}
                        <ellipse cx="10" cy="10" rx="3" ry="4" fill="white" fillOpacity="0.4" />
                        {/* Knot */}
                        <polygon points="15,28 12,30 18,30" fill={balloon.color} />
                        {/* String */}
                        <path d="M15 30 Q12 35 15 40" stroke={balloon.color} strokeWidth="1" fill="none" />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
}

// Confetti for special occasions
function FloatingConfetti() {
    const confetti = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 6 + Math.random() * 4,
            size: 8 + Math.random() * 8,
            color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB', '#2ECC71'][i % 6],
            rotation: Math.random() * 360,
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
            {confetti.map((piece) => (
                <motion.div
                    key={piece.id}
                    className="absolute"
                    style={{
                        left: `${piece.left}%`,
                        top: '-20px',
                        width: piece.size,
                        height: piece.size * 0.6,
                        backgroundColor: piece.color,
                        borderRadius: '2px',
                    }}
                    animate={{
                        y: ['0vh', '105vh'],
                        x: [0, Math.sin(piece.id) * 50],
                        rotate: [piece.rotation, piece.rotation + 720],
                    }}
                    transition={{
                        duration: piece.duration,
                        repeat: Infinity,
                        delay: piece.delay,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

// Floating Custom Images
function FloatingCustomImages({ imageUrl }: { imageUrl: string }) {
    const items = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 10 + Math.random() * 5,
            size: 30 + Math.random() * 30,
            opacity: 0.5 + Math.random() * 0.4,
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    className="absolute"
                    style={{
                        left: `${item.left}%`,
                        top: '-60px',
                        opacity: item.opacity,
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, Math.sin(item.id) * 30],
                        rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: 'linear',
                    }}
                >
                    <img
                        src={imageUrl}
                        alt=""
                        style={{ width: item.size, height: item.size }}
                        className="object-contain"
                    />
                </motion.div>
            ))}
        </div>
    );
}

// Static Decorations - fixed position display with full customization
function StaticDecorations({
    imageUrl,
    position,
    size = 'medium',
    rotation = 0,
    flipH = false,
    flipV = false
}: {
    imageUrl: string;
    position?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    rotation?: number;
    flipH?: boolean;
    flipV?: boolean;
}) {
    const positionStyles: Record<string, string> = {
        'top-left': 'top-2 left-2 md:top-4 md:left-4 lg:top-8 lg:left-8',
        'top-right': 'top-2 right-2 md:top-4 md:right-4 lg:top-8 lg:right-8',
        'bottom-left': 'bottom-2 left-2 md:bottom-4 md:left-4 lg:bottom-8 lg:left-8',
        'bottom-right': 'bottom-2 right-2 md:bottom-4 md:right-4 lg:bottom-8 lg:right-8',
    };

    // Size mapping based on user selection
    const sizeMap: Record<string, { mobile: string; tablet: string; desktop: string; bgSize: string }> = {
        small: { mobile: 'w-10 h-10', tablet: 'md:w-14 md:h-14', desktop: 'lg:w-20 lg:h-20', bgSize: '40px 40px' },
        medium: { mobile: 'w-16 h-16', tablet: 'md:w-24 md:h-24', desktop: 'lg:w-36 lg:h-36', bgSize: '80px 80px' },
        large: { mobile: 'w-20 h-20', tablet: 'md:w-32 md:h-32', desktop: 'lg:w-48 lg:h-48', bgSize: '120px 120px' },
        xlarge: { mobile: 'w-24 h-24', tablet: 'md:w-40 md:h-40', desktop: 'lg:w-64 lg:h-64', bgSize: '160px 160px' },
    };

    const currentSize = sizeMap[size] || sizeMap.medium;
    const sizeClass = `${currentSize.mobile} ${currentSize.tablet} ${currentSize.desktop}`;

    // Build transform style
    const transforms: string[] = [];
    if (rotation) transforms.push(`rotate(${rotation}deg)`);
    if (flipH) transforms.push('scaleX(-1)');
    if (flipV) transforms.push('scaleY(-1)');
    const transformStyle = transforms.length > 0 ? transforms.join(' ') : undefined;

    const imgStyle = {
        background: 'transparent',
        transform: transformStyle,
    };

    // For corners mode - show in all 4 corners
    if (position === 'corners') {
        return (
            <div className="fixed inset-0 pointer-events-none z-[100]">
                <img src={imageUrl} alt="" className={`fixed top-2 left-2 md:top-4 md:left-4 ${sizeClass} object-contain`} style={imgStyle} />
                <img src={imageUrl} alt="" className={`fixed top-2 right-2 md:top-4 md:right-4 ${sizeClass} object-contain`} style={imgStyle} />
                <img src={imageUrl} alt="" className={`fixed bottom-2 left-2 md:bottom-4 md:left-4 ${sizeClass} object-contain`} style={imgStyle} />
                <img src={imageUrl} alt="" className={`fixed bottom-2 right-2 md:bottom-4 md:right-4 ${sizeClass} object-contain`} style={imgStyle} />
            </div>
        );
    }

    // For background mode - full screen pattern
    if (position === 'background') {
        return (
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-10 md:opacity-15"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: currentSize.bgSize,
                }}
            />
        );
    }

    // Single position
    const posClass = positionStyles[position || 'top-right'] || positionStyles['top-right'];
    return (
        <div className={`fixed ${posClass} pointer-events-none z-[100]`}>
            <img
                src={imageUrl}
                alt=""
                className={`${sizeClass} object-contain drop-shadow-lg`}
                style={imgStyle}
            />
        </div>
    );
}

export function ThemeDecorations({ theme }: ThemeDecorationsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Get decoration types - support both array and single value (backward compatibility)
    const decorationTypes = theme?.decoration_types?.length
        ? theme.decoration_types
        : theme?.decoration_type
            ? [theme.decoration_type]
            : [];

    console.log('[ThemeDecorations] mounted:', mounted, 'theme:', theme?.name, 'types:', decorationTypes);

    if (!mounted || !theme || decorationTypes.length === 0) return null;

    const decorationColor = theme.decoration_color || '#FF0000';

    // Render single decoration type
    const renderDecoration = (type: string) => {
        switch (type) {
            case 'hearts':
                return <FloatingHearts key="hearts" color={decorationColor} />;
            case 'lanterns':
                return <FloatingCrescentStars key="lanterns" color={decorationColor} />;
            case 'balloons':
                return <FloatingBalloons key="balloons" color={decorationColor} />;
            case 'confetti':
                return <FloatingConfetti key="confetti" />;
            case 'custom':
                // Render multiple custom decorations
                if (theme.custom_decorations && theme.custom_decorations.length > 0) {
                    return (
                        <>
                            {theme.custom_decorations.map((dec) => {
                                if (!dec.url) return null;
                                if (dec.mode === 'static') {
                                    return (
                                        <StaticDecorations
                                            key={dec.id}
                                            imageUrl={dec.url}
                                            position={dec.position}
                                            size={dec.size}
                                            rotation={dec.rotation}
                                            flipH={dec.flip_horizontal}
                                            flipV={dec.flip_vertical}
                                        />
                                    );
                                }
                                return <FloatingCustomImages key={dec.id} imageUrl={dec.url} />;
                            })}
                        </>
                    );
                }
                // Fallback to legacy single image
                if (theme.custom_decoration_url) {
                    if (theme.decoration_mode === 'static') {
                        return (
                            <StaticDecorations
                                key="custom"
                                imageUrl={theme.custom_decoration_url}
                                position={theme.static_position}
                                size={theme.image_size}
                                rotation={theme.image_rotation}
                                flipH={theme.flip_horizontal}
                                flipV={theme.flip_vertical}
                            />
                        );
                    }
                    return <FloatingCustomImages key="custom" imageUrl={theme.custom_decoration_url} />;
                }
                return null;
            default:
                return null;
        }
    };

    // Render all selected decoration types
    return (
        <>
            {decorationTypes.map(type => renderDecoration(type))}
        </>
    );
}
