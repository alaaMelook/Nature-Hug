export const languages = ['en', 'ar'] as const;
export type Lang = (typeof languages)[number];
