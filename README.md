# MasterLink Frontend

The official frontend for **MasterLink Technology & Digital Marketing**, built with **React, TypeScript, and Vite**.

MasterLink is a modern bilingual company website and administrative dashboard designed to showcase digital services, projects, client work, testimonials, and company content while providing a secure interface for managing the platform.

## Tech Stack

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Motion
* Laravel Sanctum
* REST API

## Features

* Responsive Arabic and English website
* Services and projects showcase
* Client logos and testimonials
* Consultation interface
* Admin authentication
* Role-based permissions
* Protected administration dashboard
* CRUD management for services, projects, posts, categories, media, testimonials, client logos, consultations, and settings
* Media upload and management
* API-based data synchronization with Laravel
* Permanent hard-delete workflow

## Architecture

```text
React Frontend
      ↓
Axios / REST API
      ↓
Laravel Backend
      ↓
MySQL
```

The Laravel backend acts as the authoritative source of application data, while React provides the user interface and administrative experience.

## Project Structure

```text
src/
├── api/          # Laravel API clients
├── components/   # Website and Admin UI
├── context/      # Authentication, data, and language state
├── lib/          # Permissions and shared logic
├── pages/        # Application pages
├── assets/       # Static assets
└── utils/        # Utility functions
```

## Development

```bash
npm install
npm run dev
```

Configure the backend API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Build the application:

```bash
npm run build
```

**Status:** Active development and progressive integration with the MasterLink Laravel backend.
