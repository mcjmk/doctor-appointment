// This is a template file. Copy it to environment.ts and environment.development.ts
// Make sure you have created a .env file in the root directory with your Firebase configuration

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: process.env['FIREBASE_API_KEY'],
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
    projectId: process.env['FIREBASE_PROJECT_ID'],
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['FIREBASE_APP_ID']
  }
};
