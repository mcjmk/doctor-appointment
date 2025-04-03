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
   - Create a new Firebase project
   - Enable Authentication and Realtime Database
   - Copy `.env.example` to `.env` and fill in your Firebase configuration values from the Firebase Console
   - Copy `src/environments/environment.template.ts` to `src/environments/environment.ts` and `src/environments/environment.development.ts`

4. Start the development server:
   ```bash
   npm start
   ```

5. Go to to `http://localhost:4200/`