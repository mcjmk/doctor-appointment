# Doctor Appointment System

A web application for managing doctor appointments, built with Angular and Firebase. Allows doctors to manage their availability and patients to book appointments efficiently.

## Features

- User Authentication (Login/Register)
- Interactive Calendar View

### Doctor Panel
- Manage availability
- Set absence periods
- View and manage appointments
- Cancel appointments for a day

### Patient Dashboard
- Book appointments
- Cancel appointments
- View appointment history

### Admin Panel
- Manage users
- Change data persistence options

## Tech Stack

- Angular 18
- Firebase (Authentication & Realtime Database)
- Angular Material
- TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Firebase account and project

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mcjmk/doctor-appointment.git
   cd doctor-appointment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Realtime Database
   - Get your Firebase configuration from Project Settings > General > Your apps > Web app
   - Copy the environment template files:
     ```bash
     cp src/environments/environment.template.ts src/environments/environment.ts
     cp src/environments/environment.template.ts src/environments/environment.development.ts
     ```
   - Open both files and replace the placeholder values with your Firebase configuration:
     ```typescript
     firebaseConfig: {
       apiKey: 'your-api-key-here',           // Replace with your API key
       authDomain: 'your-auth-domain-here',   // Replace with your auth domain
       projectId: 'your-project-id-here',     // Replace with your project ID
       storageBucket: 'your-bucket-here',     // Replace with your storage bucket
       messagingSenderId: 'your-sender-id',   // Replace with your sender ID
       appId: 'your-app-id-here'             // Replace with your app ID
     }
     ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Go to to `http://localhost:4200/`