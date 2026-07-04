# LUWAS: Travel Smarter, Journey Further

**Luwas** is a modern web and mobile travel management platform designed for Philippine travel agencies and travelers.  
It enables users to discover destinations, book trips and itineraries, track travel history, and experience descriptive analytics through a seamless, intelligent, and responsive interface.

---

## Overview

Luwas reimagines how travelers explore and how agencies operate—combining data analytics, AI-powered insights, and real-time updates into one unified platform.  
It supports multi-device access (web and mobile) and includes an administrative panel for travel agencies to manage destinations, bookings, itineraries, and user analytics efficiently.

> “Travel smarter with LUWAS — your journey, your story.”

---

## Key Features

### For Travelers
- **Destination Discovery:** Browse featured destinations and curated itineraries across the Philippines.  
- **Smart Booking System:** Book trips, upload IDs, and confirm travel dates in one streamlined process.  
- **In-App Chat Support:** Receive real-time assistance from agency staff.  
- **Travel History Tracker:** View upcoming, completed, or cancelled trips through an interactive timeline.  
- **Weather Insights:** Access AI-generated “Best Time to Visit” summaries and real-time weather forecasts.  
- **Review System:** Submit and view traveler reviews with aggregated insights from Yelp or AI summaries.

### For Administrators
- **Analytics Dashboard:** Visualize user growth, booking trends, and itinerary performance using dynamic charts.  
- **Destination Management:** Add, edit, and remove destinations and promotional offers.  
- **Itinerary Management:** Create and manage fixed travel packages (e.g., “7 Days in Palawan”).  
- **Booking Management:** Approve, update, or delete bookings in real time.  
- **Automated Email Receipts:** Generate and send downloadable, branded PDF receipts.  
- **Descriptive Analytics:** Gain insights through detailed data trends and performance metrics.

---

## Technology Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend (Web)** | Next.js 15, React 19, TypeScript, TailwindCSS, ShadCN UI, Framer Motion |
| **Backend / Database** | Firebase (Firestore, Storage, Authentication), Firebase Admin SDK |
| **APIs and Integrations** | OpenAI, Yelp API, OpenStreetMap, Wikipedia, Weather API |
| **Payments** | PayMongo, QRPH Integration |
| **Email Services** | Resend (Transactional Emails) |
| **File Uploads** | UploadThing, Imgur |
| **Mobile Application** | React Native (Firebase Integration) - See separate repository: **luwas-mobile** |
| **Analytics and Visualization** | Recharts, Firestore Aggregations |
| **Notifications** | Twilio (SMS Messaging) |

---

## System Architecture

**Three-Tier Architecture Design:**

1. **Presentation Layer** – Next.js (Client-side UI, Routing, and Component Rendering)  
2. **Logic Layer** – Firebase Admin SDK (Authentication, Firestore Queries, Data Management, and Analytics)  
3. **Data Layer** – Firestore Database (Collections for Destinations, Itineraries, Users, Bookings, and Reviews)

---

## Flow

| Page | Description |
|------|--------------|
| Home Page | Displays featured destinations and call-to-action elements |
| Destination Page | Contains dynamic destination details, booking forms, and user reviews |
| Itinerary Page | Displays pre-planned tour packages with AI-based insights |
| Admin Dashboard | Provides analytical insights through interactive charts |
| Chat Support | Enables real-time communication between travelers and administrators |
| Booking History | Displays filtered travel records in an animated timeline layout |

---

## Installation and Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/moncitohernandez/luwas-travel.git
cd luwas-travel

```

## Mobile Version

The mobile version of Luwas is developed using React Native with Firebase integration.
It shares the same backend and authentication system as the web version, allowing seamless synchronization between devices.

Repository: github.com/moncitohernandez/luwas-mobile

--- 

## Developer Information

Moncito Glenn Nepomuceno Hernandez
Bachelor of Science in Information Technology
National University – Manila

## License

This project is licensed under the MIT License.
It is free to use, modify, and distribute for educational and non-commercial purposes.
