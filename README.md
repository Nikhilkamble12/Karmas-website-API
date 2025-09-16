# 📱 Karmas-Mobile-API

![License](https://img.shields.io/badge/license-Proprietary-red)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Backend-Express-blue)
![Database](https://img.shields.io/badge/Database-MySQL-orange)

> 🔒 This repository contains the **Phone Application API** powering **Karmas Mobile App** — a **social media platform for NGOs and communities**.  
The API handles **authentication, posts, events, donations, chat, and more**, ensuring secure and scalable communication between the mobile app and backend services.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔑 Authentication | Secure login/signup with JWT |
| 👤 User Profiles | Manage personal info, profile pictures, and settings |
| 📸 Media Sharing | Upload & fetch images/videos |
| 📝 Posts & Feeds | Create, like, comment & share posts |
| 📅 Events | NGO & community events with RSVP support |
| 🚨 SOS for Girls | Emergency SOS trigger with real-time WebSocket alerts |
| 🔔 Notifications | Push & in-app notifications for posts, events, and SOS alerts |
| 📊 Analytics | Engagement tracking & reporting |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| ⚙️ **Backend Framework** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) + ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) |
| 🗄️ **Database** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) / ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white) |
| 🔄 **ORM** | ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white) |
| 🔑 **Authentication** | ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| 🗂️ **File Storage** | ![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white) / Local Storage |
| ⚡ **Real-time** | ![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=socketdotio&logoColor=white) |
| 🔔 **Notifications** | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) |

---

## 🚀 Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/Karmas-Mobile-API.git
cd Karmas-Mobile-API

2️⃣ Install dependencies
npm install

3️⃣ Configure Environment Variables

Create a .env file in the root directory:
# 🌐 Common Environment Variables
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

# 🔐 Encryption/Decryption Configuration
ENCRYPTION_SECRET_KEY=your_encryption_secret_key
ENCRYPTION_IV=your_initialization_vector

# 🛠️ Local (Development/Testing) Database Configuration
DEV_DB_USER=your_db_user
DEV_DB_PASSWORD=your_db_password
DEV_DB_NAME=your_db_name
DEV_DB_HOST=localhost
DEV_DB_DIALECT=mysql
DEV_DB_PORT=3306

# ☁️ Amazon S3 Configuration
AMAZON_ACCESS_KEY_ID_S3=your_aws_access_key
AMAZON_SECRET_KEY_ID_S3=your_aws_secret_key

# 🌍 Live Server URL
GET_LIVE_CURRENT_URL=http://localhost:3000

# 📧 Email Setup
EMAIL_FROM=karmasotp@gmail.com
EMAIL_USER=karmasotp@gmail.com
EMAIL_PASS=your_email_password
EMAIL_SERVICE=gmail

## 🔥 Firebase Setup
For Firebase configuration, follow the instructions here:  
📂 [server/middleware/external_documents/firebase/read.md](https://github.com/Nikhilkamble12/Karmas-website-API/blob/main/server/middleware/external_documents/firebase/read.md)
This file explains how to obtain `karmas.firebase.json` and where to store it.

4️⃣ Run the server
npm start
```
---

## 📬 Contact / Maintainers  

### 👨‍💻 Maintainer: Nishant More  
- 📧 **Email**: [nishantmore228@gmail.com](mailto:nishantmore228@gmail.com)  
- 🐙 **GitHub**: [github.com/nishantmore9](https://github.com/nishantmore9)  
- 🐦 **Twitter (X)**: [x.com/nishantmore228](https://x.com/nishantmore228)  
- 📸 **Instagram**: [instagram.com/nishantmore77](https://www.instagram.com/nishantmore77/)  

![Email](https://img.shields.io/badge/Email-nishantmore228%40gmail.com-red?logo=gmail&logoColor=white)  
![GitHub](https://img.shields.io/badge/GitHub-nishantmore9-black?logo=github)
![Twitter](https://img.shields.io/badge/Twitter-%40nishantmore228-1DA1F2?logo=twitter&logoColor=white)  
![Instagram](https://img.shields.io/badge/Instagram-%40nishantmore77-E4405F?logo=instagram&logoColor=white)  

---

### 👑 Owner: Nikhil Kamble  
- 📧 **Email**: [nikhilkamble096@gmail.com](mailto:nikhilkamble096@gmail.com)  
- 🐙 **GitHub**: [github.com/Nikhilkamble12](https://github.com/Nikhilkamble12)  

![Email](https://img.shields.io/badge/Email-nikhilkamble096%40gmail.com-red?logo=gmail&logoColor=white)  
![GitHub](https://img.shields.io/badge/GitHub-Nikhilkamble12-black?logo=github)  


---
