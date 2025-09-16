
🔥 Firebase Setup Guide for Developers
📍 Where to Find Firebase Config (if it already exists)

If the Firebase project is already created, you don’t need to create a new one.
Follow these steps to locate the config:

1️⃣ Go to Firebase Console
👉 https://console.firebase.google.com/

2️⃣ Select the Existing Project

Example: Karmas-Mobile-App

3️⃣ Open Project Settings

Click the ⚙️ Settings icon (top left of the sidebar)

Select Project settings

4️⃣ Scroll to "Your Apps" Section

If a Web App (</>) is already registered, you’ll see the config.

If not, register a new Web App (no need to change backend).

5️⃣ Find Config Under "SDK setup and configuration"
It will look like this 👇

const firebaseConfig = {
  apiKey: "AIzaSyXXXXX-XXXXX-XXXXX",
  authDomain: "karmas-app.firebaseapp.com",
  projectId: "karmas-app",
  storageBucket: "karmas-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdefg1234567",
  measurementId: "G-XXXXXXXXXX"
};


6️⃣ Copy & Paste

If your repo uses:

karmas.firebase.json → paste values inside JSON.

.env → add values there.
