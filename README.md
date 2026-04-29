# PassForge 🔐
### Craft Strong, Secure Passwords Instantly

![GitHub repo size](https://img.shields.io/github/repo-size/Tahsin-banu/PassForge)
![GitHub stars](https://img.shields.io/github/stars/Tahsin-banu/PassForge)
![GitHub forks](https://img.shields.io/github/forks/Tahsin-banu/PassForge)

---

## 🎯 About The Project

PassForge is a full-stack password generator web application built with a premium glassmorphism dark UI. It generates cryptographically secure passwords instantly with real-time strength analysis and password history tracking.

---

## ✨ Features

- ⚡ Cryptographically secure password generation
- 📊 Real-time password strength indicator
- 📋 One-click copy to clipboard
- 🕒 Password history tracking
- 👁️ Show/Hide password toggle
- 🎨 Beautiful glassmorphism dark theme UI
- 📱 Fully responsive design
- 💾 MongoDB database integration
- 🔗 RESTful API backend

---

## 🛠️ Tech Stack

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white)

### Database
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)

---

## 📂 Folder Structure

```
passforge/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── db.js
├── .env
├── package.json
│
├── models/
│   └── Password.js
│
└── routes/
    └── passwordRoutes.js
```

---

## 🚀 How To Run Locally

### Prerequisites
- Node.js installed
- MongoDB Atlas account

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/Tahsin-banu/PassForge.git
cd PassForge
```

**2. Install dependencies**
```bash
npm install
```

**3. Create .env file**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

**4. Start the server**
```bash
npm run dev
```

**5. Open frontend**

Open `index.html` in your browser!

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/password/generate | Generate and save password |
| GET | /api/password/history | Get last 20 passwords |
| DELETE | /api/password/:id | Delete a password record |

---

## 📸 Project Preview

> PassForge features a stunning dark glassmorphism UI with purple, pink and cyan color theme.

---

## 🔮 Future Improvements

- User authentication with JWT
- Password encryption with bcrypt
- Deploy on Vercel + Render
- Passphrase generator
- Browser extension

---

## 👩‍💻 Developer

**Tahsin Banu**
- GitHub: [@Tahsin-banu](https://github.com/Tahsin-banu)
- Internship: SoftGrow Tech

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

⭐ **If you found this project helpful, please give it a star!** ⭐
