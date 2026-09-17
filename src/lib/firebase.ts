import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  projectId: "silver-fiber-267314",
  appId: "1:676890928921:web:9f10ce5d94ab32dfa60788",
  apiKey: "AIzaSyDsyOEyGIWPp0Hitl4tVUmEbWOdSFDwTe8",
  authDomain: "silver-fiber-267314.firebaseapp.com",
  storageBucket: "silver-fiber-267314.firebasestorage.app",
  messagingSenderId: "676890928921",
};

const app = initializeApp(firebaseConfig);

// Enable offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    tabManager: persistentMultipleTabManager() 
  })
});

export const auth = getAuth(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
  } catch (error) {
    console.error('Erro ao obter token FCM:', error);
  }
  return null;
};
