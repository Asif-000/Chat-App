# 💬 Chat App

A real-time web-based chat application where users can sign up, verify their email, and chat with others using text, emojis, and file sharing. Simple, interactive, and built for demo and development use.

## 🌐 Live Demo

[Click here to try the app live](https://your-live-site-url.com)

## 🛠️ Tech Stack

This project is built with:

- ⚡ Vite
- 🟦 TypeScript
- ⚛️ React
- 🎨 Tailwind CSS
- 🧩 [shadcn/ui](https://ui.shadcn.com/)
- 🛢️ Supabase (Auth + Realtime DB)
- ▲ Deployed on Vercel

## 🚀 Features

- ✅ Email & password authentication
- ✉️ Email verification required to log in
- 🧑‍🤝‍🧑 Add other users as chat contacts
- 💬 Real-time messaging
- 😊 Emoji support
- 📁 Send and receive files
- 🔒 Works in multiple sessions (e.g. private/incognito windows)

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Asif-000/Chat-App.git
cd Chat-App
```

### 2. Install Dependencies 

```bash
npm install
```

### 4. Run the App

```bash
npm run dev
```

### 3. Configure Backend

- Set up your authentication and database (e.g., Supabase, Firebase).
- Add your API keys/config in the config file (e.g., `config.js`, `supabase.js`, or `.env` depending on your setup).

## 🧑‍💻 How to Use

### 🔐 Sign Up and Verify

1. Go to the **Sign Up** page.
2. Enter a **username**, **email**, and **password**.
3. Check your email and **verify your email address**.
4. You **cannot log in until your email is verified**.

> ⚠️ Attempting to log in before verification will be blocked.

### 👥 Add Other Users

- Once logged in, you'll see a list of users.
- Select a user and send a request to chat.
- You can also open a **private/incognito window** and register another user to simulate multiple users chatting.

### 💬 Start Chatting

- After adding a user, start sending messages.
- Use the emoji picker to include emojis in your messages.
- Upload and send files like images and documents.

## 🧪 Testing Tips

- Use **private/incognito windows** to log in with different users and chat between them in real time.
- Some test/demo users may already be available for chatting.

## 📸 Screenshots

![Sign up UI](./assets\Sign-up.jpg)



