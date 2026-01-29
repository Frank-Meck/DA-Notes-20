import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

// Firebase Config direkt hier, ohne environment.ts
const firebaseConfig = {
 apiKey: "AIzaSyBZs6Qno46G0b1KbI7xJwPjr99Ny3fKOZU",
  authDomain: "danotes-20.firebaseapp.com",
  projectId: "danotes-20",
  storageBucket: "danotes-20.firebasestorage.app",
  messagingSenderId: "505177077052",
  appId: "1:505177077052:web:68a9988a95f42c657bda39"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Firebase App initialisieren
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // Firestore bereitstellen
    provideFirestore(() => getFirestore())
  ]
};
