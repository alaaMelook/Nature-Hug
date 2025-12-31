// Firebase Messaging Service Worker
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (must match your app config)
const firebaseConfig = {
    apiKey: "AIzaSyBbsvGyglircTiUURaY38U5ReseHXtK0vQ",
    authDomain: "nature-hug-fa159.firebaseapp.com",
    projectId: "nature-hug-fa159",
    storageBucket: "nature-hug-fa159.firebasestorage.app",
    messagingSenderId: "129215047588",
    appId: "1:129215047588:web:5fe982a1531ef9d5fe8331",
    measurementId: "G-156J9V2ZWQ"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'New Order!';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new order',
        icon: '/email_verify.png',
        badge: '/email_verify.png',
        tag: 'order-notification',
        data: payload.data,
        requireInteraction: true,
        // Sound - browser will use default notification sound
        silent: false,
        // Vibration pattern for mobile [vibrate, pause, vibrate, pause, vibrate]
        vibrate: [200, 100, 200, 100, 200],
        // Renotify even if same tag (for multiple orders)
        renotify: true,
        actions: [
            {
                action: 'view',
                title: 'View Order'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    const orderId = event.notification.data?.order_id;
    const urlToOpen = orderId
        ? `/en/admin/orders/${orderId}`
        : '/en/admin/orders';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes('/admin') && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open a new window if none exists
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
