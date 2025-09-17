# 🔥 Firebase Setup for Karmas-Mobile-API

## 📍 Steps to Find / Add Firebase Config

1️⃣ Go to **[Firebase Console](https://console.firebase.google.com)**  
2️⃣ Select your project → **`Karmas-Mobile-App`**  
3️⃣ Open **⚙️ Project Settings**  
4️⃣ Scroll down to **"Your Apps"** → choose **Web App config**  
5️⃣ Copy the **Firebase SDK Config** → it should look like this:

```json
{
  "apiKey": "AIzaSyXXXXX-XXXXX-XXXXX",
  "authDomain": "karmas-app.firebaseapp.com",
  "projectId": "karmas-app",
  "storageBucket": "karmas-app.appspot.com",
  "messagingSenderId": "1234567890",
  "appId": "1:1234567890:web:abcdefg1234567",
  "measurementId": "G-XXXXXXXXXX"
}

```
📂 Where to Store the Config

👉 Save the file exactly at this location in the repo:

```
Karmas-website-API
└── server
    └── middleware
        └── external_documents
            └── firebase
                └── karmas.firebase.json ✅
```

