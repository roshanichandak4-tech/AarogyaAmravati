# 🏥 Amravati District Hospital Management & Live OPD Queue System

A full-stack, real-time digital queue management and hospital directory application built for hospitals and patients in Amravati District, Maharashtra.

---

## 🌟 Key Features

1. **Live OPD Queue Counter**:
   * Patients can view live current token numbers, waiting counts, and estimated wait times.
   * Real-time Socket.io synchronization across all connected patient devices.

2. **Instant Hospital Registration**:
   * Any hospital can register their administrator account.
   * Registered hospitals automatically appear as active cards on the main public dashboard.

3. **Date-Wise Patient Records Logging**:
   * Patient registrations and OPD call logs are stored date-wise in text files under `server/data/patient_records/records_YYYY-MM-DD.txt`.

4. **Direct WhatsApp Web Integration**:
   * Token generation and "Call Next Patient" trigger prefilled WhatsApp Web dispatch links to notify patients directly on their mobile number.

5. **Doctor Roster & Blood Availability**:
   * Hospital admins can manage doctor availability and update real-time blood bank stock levels.

6. **Voice + Text AI Healthcare Assistant**:
   * Integrated AI chatbot for voice and text medical queries and district hospital guidance.

---

## 🚀 How to Run the Project (VS Code / Terminal)

### Prerequisites:
* **Node.js** (v18 or higher installed)

### Step-by-Step Instructions:

1. **Open Project Folder**:
   Open VS Code and choose `File -> Open Folder` -> select this project folder.

2. **Open Terminal**:
   Press `Ctrl + ~` (or go to `Terminal -> New Terminal`).

3. **Start the Server**:
   ```bash
   node server/server.js
   ```

4. **Open in Web Browser**:
   Navigate to: **http://localhost:5000**

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Hospital Admin** | `irwin@amravatihospitals.gov.in` | `admin123` | Manage Irwin Hospital OPD Queue & Doctors |

---

## 📁 Directory Structure Overview

```text
├── server/
│   ├── server.js                 # Express server & Socket.io setup
│   ├── seedData.js               # Seed data for Amravati hospitals & doctors
│   ├── data/
│   │   ├── db.json               # Persistent JSON database
│   │   └── patient_records/      # Daily date-stamped patient log files
│   ├── routes/                   # API routes (auth, hospitals, tokens, doctors, AI)
│   └── middleware/               # JWT authentication middleware
├── client/
│   ├── src/
│   │   ├── pages/                # Public dashboard, hospital details, admin dashboard
│   │   ├── components/           # Navbar, footer, chatbot, QR code modal
│   │   └── context/              # Auth & Socket contexts
│   └── dist/                     # Production compiled frontend bundle
└── package.json                  # Root dependencies & scripts
```

---
*Created for Amravati District Healthcare Initiative.*
