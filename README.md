# 🚀 CN Portal

A modern, high-performance EdTech platform designed for cloud-native learning management. This portal provides a seamless interface for students to access curriculum content and for administrators to manage sessions, attendance, and media resources.

![CN Portal Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Firebase%20%7C%20Tailwind-orange)

---

## ✨ Key Features

### 🎓 Student Portal
- **DevOps Dashboard**: Real-time overview of current and upcoming learning sessions.
- **Video Library**: Group-based access to curriculum videos hosted on Google Drive.
- **Attendance Tracking**: Personal record of session participation.
- **AI Career Co-pilot**: (Coming Soon) AI-powered mentor for roadmap guidance.

### 🛡️ Admin Suite
- **Session Manager**: Schedule, update, and delete learning sessions with ease.
- **Attendance Control**: Real-time monitoring and manual check-in of students.
- **Folder Orchestration**: Link Google Drive folders to specific student batch groups.
- **Student Management**: Granular control over student groups and library permissions.

---

## 🛠️ Technical Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Utility-first design)
- **Database**: Firebase Firestore (NoSQL, Real-time)
- **Auth**: Firebase Authentication (Google OAuth)
- **Animations**: Framer Motion (Route transitions and micro-interactions)
- **Icons**: Lucide React

---

## 🚀 Deployment (GitHub Pages)

This project is configured for automated deployment via GitHub Actions.

1. **Configure Repository**: 
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**, set Source to **GitHub Actions**.

2. **Secrets Setup**:
   Ensure you have your Firebase configuration in `src/firebase.ts` or set as environment variables if you've customized the build.

---

## 📦 Setup & Installation

```bash
# Clone the repository
git clone https://github.com/maverick0011/cn-portal.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Security

This portal utilizes **Attribute-Based Access Control (ABAC)** via Firestore Security Rules. Access to video folders is restricted based on student `groups` and `hasVideoAccess` flags, ensuring data privacy and curriculum integrity.

---

Designed with ❤️ for Cloud-Native Learners.
