"use client";

import { Theme } from "@/domain/entities/database/theme";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemeDecorations } from "@/ui/components/store/ThemeDecorations";

interface ThemeContextType {
    theme: Theme | null;
    loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: null,
    loading: true,
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveTheme = async () => {
            try {
                console.log('[ThemeProvider] Fetching active theme...');
                const res = await fetch('/api/store/active-theme');
                if (res.ok) {
                    const { theme: activeTheme } = await res.json();
                    console.log('[ThemeProvider] Active theme:', activeTheme);
                    setTheme(activeTheme);

                    // Apply CSS variables if theme has custom colors
                    if (activeTheme && activeTheme.name !== 'Default') {
                        console.log('[ThemeProvider] Applying theme colors for:', activeTheme.name);
                        applyThemeColors(activeTheme);
                    }
                } else {
                    console.log('[ThemeProvider] Failed to fetch theme, status:', res.status);
                }
            } catch (error) {
                console.error('[ThemeProvider] Failed to fetch active theme:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveTheme();
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, loading }}>
            {/* Render decorations globally */}
            <ThemeDecorations theme={theme} />
            {children}
        </ThemeContext.Provider>
    );
}

// Apply theme colors as CSS variables
function applyThemeColors(theme: Theme) {
    const root = document.documentElement;

    if (theme.primary_color) {
        // Convert hex to HSL for CSS variable compatibility
        const hsl = hexToHSL(theme.primary_color);
        root.style.setProperty('--theme-primary', theme.primary_color);
        root.style.setProperty('--theme-primary-h', hsl.h.toString());
        root.style.setProperty('--theme-primary-s', `${hsl.s}%`);
        root.style.setProperty('--theme-primary-l', `${hsl.l}%`);
    }

    if (theme.secondary_color) {
        root.style.setProperty('--theme-secondary', theme.secondary_color);
    }

    if (theme.accent_color) {
        root.style.setProperty('--theme-accent', theme.accent_color);
    }
}

// Helper to convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
