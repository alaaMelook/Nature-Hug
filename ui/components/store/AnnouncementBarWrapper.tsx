'use client';

import { useTheme } from '@/ui/providers/ThemeProvider';
import { AnnouncementBar } from './AnnouncementBar';

export function AnnouncementBarWrapper() {
    const { theme } = useTheme();
    return <AnnouncementBar theme={theme} />;
}
