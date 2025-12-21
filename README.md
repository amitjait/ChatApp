# 💬 ChatApp

A real-time chat application built with React and Socket.IO for seamless instant messaging between users.

---

## 🚀 Features

- 🔐 User authentication (login / logout)
- 💬 Real-time 1-to-1 messaging
- 👥 Contact list & online/offline status
- 🎨 Responsive UI with Tailwind CSS
- 🧠 Logout confirmation modal
- 📡 Powered by Socket.IO

---

## 🧱 Tech Stack

**Frontend**
- React
- React Context API
- Tailwind CSS
- Socket.IO Client
- Lucide Icons

**Backend** (optional)
- Node.js
- Express
- Socket.IO Server

---

## 📁 Project Structure

```bash
ChatApp/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # UI components (Sidebar, Chat, Modal)
│   │   ├── contexts/      # Auth & Socket context providers
│   │   ├── pages/         # Authentication & chat pages
│   │   └── utils/
│   └── package.json
├── server/                # Backend (if included)
│   ├── routes/
│   ├── socket/
│   └── index.js
├── .gitignore
└── README.md
```

#Steps to run

- git clone https://github.com/amitjait/ChatApp.git
- cd ChatApp

#Front End
- cd client
- npm install
- npm run dev

#Backend
- cd server
- npm install
- npm run dev


#.env Front End 
VITE_API_URL=http://localhost:5001 {backend  server base url}

#.env Backend 
SERVER_PORT=5001
AZURE_STORAGE_ACCOUNT_NAME={storage_name}
AZURE_STORAGE_ACCOUNT_KEY={storage_account_key}
AZURE_CONTAINER_NAME={container_name} // uploads





