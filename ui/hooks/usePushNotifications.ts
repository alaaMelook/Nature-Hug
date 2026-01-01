// ui/hooks/usePushNotifications.ts 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, VAPID_KEY } from '@/lib/firebase/firebaseConfig';
import { supabase } from '@/data/datasources/supabase/client';
import { toast } from 'sonner';

interface UsePushNotificationsReturn {
    isSupported: boolean;
    permission: NotificationPermission | 'loading';
    token: string | null;
    requestPermission: () => Promise<void>;
    isLoading: boolean;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'loading'>('loading');
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check if notifications are supported
    useEffect(() => {
        const checkSupport = async () => {
            if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
                setIsSupported(true);
                setPermission(Notification.permission);
            } else {
                setIsSupported(false);
                setPermission('denied');
            }
        };
        checkSupport();
    }, []);

    // Request permission and get FCM token
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            toast.error('Push notifications are not supported in this browser');
            return;
        }

        setIsLoading(true);

        try {
            // Request notification permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== 'granted') {
                toast.error('Permission denied for notifications');
                return;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('[Push] Service worker registered:', registration);

            // Get FCM token
            const messaging = await getFirebaseMessaging();
            if (!messaging) {
                throw new Error('Failed to initialize Firebase Messaging');
            }

            const fcmToken = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (fcmToken) {
                console.log('[Push] FCM Token:', fcmToken);
                setToken(fcmToken);

                // Save token to Supabase
                await saveTokenToDatabase(fcmToken);
                toast.success('تم تفعيل الإشعارات بنجاح! 🔔');
            } else {
                throw new Error('Failed to get FCM token');
            }

        } catch (error) {
            console.error('[Push] Error:', error);
            toast.error('فشل تفعيل الإشعارات');
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    // Listen for foreground messages and handle audio unlocking
    useEffect(() => {
        let messagingInstance: any = null;

        const setupListener = async () => {
            try {
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;
                messagingInstance = messaging;

                onMessage(messaging, (payload) => {
                    console.log('[Push] Foreground message:', payload);

                    // Play notification sound
                    try {
                        const audio = new Audio('/sounds/ka-ching.mp3');
                        audio.play().catch(e => {
                            console.warn('[Push] Audio play failed, likely blocked by browser:', e);
                            // Fallback: toast will still show
                        });
                    } catch (error) {
                        console.error('Error initializing audio:', error);
                    }

                    // Show toast notification
                    toast(payload.notification?.title || 'New Notification', {
                        description: payload.notification?.body,
                        action: payload.data?.order_id ? {
                            label: 'View',
                            onClick: () => {
                                window.location.href = `/en/admin/orders/${payload.data?.order_id}`;
                            }
                        } : undefined,
                    });
                });
            } catch (err) {
                console.error('[Push] Listener setup error:', err);
            }
        };

        if (isSupported) {
            setupListener();
        }

        // Global click listener to "unlock" audio for the browser
        const unlockAudio = () => {
            const audio = new Audio('/sounds/ka-ching.mp3');
            audio.volume = 0;
            audio.play().then(() => {
                console.log('[Push] Audio unlocked');
                window.removeEventListener('click', unlockAudio);
            }).catch(() => { });
        };

        window.addEventListener('click', unlockAudio);
        return () => window.removeEventListener('click', unlockAudio);
    }, [isSupported]);

    return {
        isSupported,
        permission,
        token,
        requestPermission,
        isLoading,
    };
}

// Save FCM token to Supabase
async function saveTokenToDatabase(token: string): Promise<void> {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.warn('[Push] No user logged in, cannot save token');
        return;
    }

    // Upsert token (insert or update if exists)
    const { error } = await supabase
        .from('fcm_tokens')
        .upsert({
            user_id: user.id,
            token: token,
            device_info: navigator.userAgent,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'token',
        });

    if (error) {
        console.error('[Push] Error saving token:', error);
        throw error;
    }

    console.log('[Push] Token saved successfully');
}
