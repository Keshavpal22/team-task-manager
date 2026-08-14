# Team Task Manager

A full-stack Team Task Manager application built with **React** and **Laravel REST API**.

The application provides role-based access for Administrators and Members, allowing teams to manage projects, assign members, create tasks, track task progress, and control access to project and task data.

---

## Features

### Authentication

- User registration
- User login
- User logout
- Current authenticated user endpoint
- Laravel Sanctum token authentication
- Protected frontend routes

### Role-Based Access Control

The application supports two roles:

- Admin
- Member

#### Admin

Admins can:

- View all projects
- Create projects
- Update projects
- Delete projects
- Assign members to projects
- Remove members from projects
- View all tasks
- Create tasks
- Update tasks
- Delete tasks

#### Member

Members can:

- View projects assigned to them
- View tasks assigned to them
- Update the status of their assigned tasks
- Access only authorized project/task data
- Cannot perform admin-only operations

Unauthorized requests return appropriate `403 Forbidden` responses.

---

# Project Management

Administrators can manage projects with:

- Project name
- Description
- Status
- Start date
- Due date
- Project creator

Supported project statuses:

- Planning
- Active
- Completed

---

# Team Management

Administrators can manage project members.

Features include:

- View available members
- Assign a member to a project
- View project members
- Remove a member from a project
- Prevent duplicate project assignments
- Ensure only users with the `member` role can be assigned

---

# Task Management

Tasks contain:

- Project
- Assignee
- Title
- Description
- Status
- Priority
- Due date
- Creator

Supported task statuses:

- Todo
- In Progress
- Completed

Supported priorities:

- Low
- Medium
- High

### Task Authorization

Admins can manage all tasks.

Members can update only the status of tasks assigned to them.

Members cannot update task details such as:

- Title
- Description
- Priority
- Project
- Assignee

---

# Tech Stack

## Frontend

- React
- React Router
- Axios
- Tailwind CSS
- Lucide React
- Vite

## Backend

- Laravel
- PHP
- Laravel Sanctum
- REST API
- MySQL

## Development Tools

- Git
- GitHub
- Postman / API testing client
- VS Code

---

# Application Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │                     │
                    │ React + Vite        │
                    │ Tailwind CSS        │
                    │ React Router        │
                    │ Axios               │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               │ Bearer Token
                               ▼
                    ┌─────────────────────┐
                    │    Laravel Backend  │
                    │                     │
                    │ REST API            │
                    │ Sanctum             │
                    │ RBAC                │
                    │ Controllers         │
                    │ Eloquent Models     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │                     │
                    │ Users               │
                    │ Projects            │
                    │ Project Members     │
                    │ Tasks               │
                    └─────────────────────┘
```

---

# Database Relationships

```text
User
 ├── Created Projects
 ├── Assigned Projects
 ├── Created Tasks
 └── Assigned Tasks

Project
 ├── Creator
 ├── Members
 └── Tasks

Task
 ├── Project
 ├── Assignee
 └── Creator
```

### Main Tables

- `users`
- `projects`
- `project_user`
- `tasks`

---

# API Endpoints

## Authentication

| Method | Endpoint             | Access        | Description         |
| ------ | -------------------- | ------------- | ------------------- |
| POST   | `/api/auth/register` | Public        | Register a new user |
| POST   | `/api/auth/login`    | Public        | Login               |
| GET    | `/api/auth/me`       | Authenticated | Get current user    |
| POST   | `/api/auth/logout`   | Authenticated | Logout              |

---

## Projects

| Method    | Endpoint             | Access        | Description    |
| --------- | -------------------- | ------------- | -------------- |
| GET       | `/api/projects`      | Authenticated | Get projects   |
| POST      | `/api/projects`      | Admin         | Create project |
| GET       | `/api/projects/{id}` | Authenticated | Get project    |
| PUT/PATCH | `/api/projects/{id}` | Admin         | Update project |
| DELETE    | `/api/projects/{id}` | Admin         | Delete project |

---

## Project Members

| Method | Endpoint                            | Access        | Description           |
| ------ | ----------------------------------- | ------------- | --------------------- |
| GET    | `/api/team/members`                 | Authenticated | Get available members |
| GET    | `/api/projects/{id}/members`        | Authenticated | Get project members   |
| POST   | `/api/projects/{id}/members`        | Admin         | Assign member         |
| DELETE | `/api/projects/{id}/members/{user}` | Admin         | Remove member         |

---

## Tasks

| Method    | Endpoint          | Access        | Description |
| --------- | ----------------- | ------------- | ----------- |
| GET       | `/api/tasks`      | Authenticated | Get tasks   |
| POST      | `/api/tasks`      | Admin         | Create task |
| GET       | `/api/tasks/{id}` | Authenticated | Get task    |
| PUT/PATCH | `/api/tasks/{id}` | Authenticated | Update task |
| DELETE    | `/api/tasks/{id}` | Admin         | Delete task |

---

# Authorization Flow

```text
                    Login
                      │
                      ▼
               Laravel Sanctum
                      │
                      ▼
                 Authenticated
                      │
              ┌───────┴───────┐
              │               │
            Admin           Member
              │               │
              ▼               ▼
        Full Management   Restricted Access
```

### Project Authorization

Members can only access projects assigned to them.

```text
Member Request
      │
      ▼
Authentication
      │
      ▼
Project Membership Check
      │
      ├── Assigned ──────► Allow
      │
      └── Not Assigned ─► 403 Forbidden
```

### Task Authorization

```text
Member
  │
  ├── View assigned task ──────► Allowed
  │
  ├── Update task status ──────► Allowed
  │
  ├── Update task details ─────► Forbidden
  │
  └── Delete task ─────────────► Forbidden
```

---

# Frontend Pages

The React frontend contains:

- Login
- Register
- Dashboard
- Projects
- Tasks
- Team Management

### Admin Navigation

```text
Dashboard
Projects
Tasks
Team
Logout
```

### Member Navigation

```text
Dashboard
Projects
Tasks
Logout
```

---

# UI Features

The frontend includes:

- Responsive dashboard
- Role-based navigation
- Protected routes
- Loading skeletons
- Authentication loading state
- API loading states
- Task status indicators
- Priority indicators
- Empty states
- Error handling
- Responsive layout
- Lucide icons
- Dashboard statistics
- Recent task display

---

# Loading Experience

The application includes loading states to improve the user experience while authentication and dashboard data are being fetched.

Loading skeletons and structured loading states are used instead of displaying only a basic loading message.

This provides a smoother and more modern user experience during API requests.

---

# Installation

## Prerequisites

Make sure the following are installed:

- PHP 8+
- Composer
- Node.js
- npm
- MySQL
- Git

---

# Backend Setup

Navigate to the backend:

```bash
cd team-task-manager-backend
```

Install PHP dependencies:

```bash
composer install
```

Create the environment file.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

---

## Database Configuration

Update the backend `.env` file with your local MySQL configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=team_task_manager
DB_USERNAME=root
DB_PASSWORD=
```

Create the database in MySQL.

Then run migrations:

```bash
php artisan migrate
```

Start the Laravel development server:

```bash
php artisan serve
```

Backend API:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd team-task-manager-frontend
```

Install dependencies:

```bash
npm install
```

Create a frontend `.env` file if required:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the Vite development server:

```bash
npm run dev
```

Frontend will normally be available at:

```text
http://localhost:5173
```

---

# Running the Application

Start the Laravel backend:

```bash
cd team-task-manager-backend
php artisan serve
```

In another terminal, start the React frontend:

```bash
cd team-task-manager-frontend
npm run dev
```

Then open the frontend URL provided by Vite.

---

# API Authentication

The application uses Laravel Sanctum for authentication.

Typical authentication flow:

```text
Register / Login
       │
       ▼
Laravel API
       │
       ▼
Sanctum Token
       │
       ▼
Frontend Authentication State
       │
       ▼
Bearer Token
       │
       ▼
Protected API Requests
```

---

# Validation and Authorization

The backend performs server-side validation for:

- Required fields
- Project existence
- User existence
- Project membership
- Task status
- Task priority
- Project dates
- User roles

### Admin-only operations

```text
Create Project
Update Project
Delete Project

Assign Project Member
Remove Project Member

Create Task
Delete Task
```

### Member restrictions

```text
Only assigned projects
Only assigned tasks
Only assigned task status updates
```

---

# Testing

The application API was tested using an API testing client.

## Authentication

Tested:

- User registration
- User login
- Current authenticated user
- Logout

## Projects

Tested:

- Create project
- List projects
- View project
- Update project
- Delete project
- Project access restriction

## Team Management

Tested:

- Get available members
- Assign member to project
- Get project members
- Remove member
- Duplicate member assignment prevention
- Admin-only member management

## Tasks

Tested:

- Create task
- List tasks
- View task
- Update task
- Delete task
- Assign task to project member
- Member task access
- Member task status update

## Authorization Testing

The following authorization scenarios were tested:

```text
Member attempting admin operation
        ↓
403 Forbidden
```

```text
Member accessing unassigned project
        ↓
403 Forbidden
```

```text
Member attempting to delete task
        ↓
403 Forbidden
```

The backend correctly prevents unauthorized operations.

---

# Security

The application implements:

- Laravel Sanctum authentication
- Bearer token authentication
- Protected API routes
- Role-based authorization
- Project-level authorization
- Task-level authorization
- Admin-only operations
- Server-side validation

Sensitive environment files are excluded from Git using `.gitignore`.

The following should never be committed:

```text
.env
API secrets
Database passwords
Authentication tokens
Production credentials
```

---

# Project Structure

```text
team-task-manager/
│
├── README.md
├── .gitignore
│
├── team-task-manager-backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   └── Models/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   │
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   │
│   ├── config/
│   ├── tests/
│   ├── composer.json
│   └── artisan
│
└── team-task-manager-frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── layouts/
    │   ├── pages/
    │   └── routes/
    │
    ├── public/
    ├── package.json
    └── vite.config.js
```

---

# Future Enhancements

The following features can be added for a production environment:

- Email-based user invitations
- Email verification
- Forgot/reset password
- Dedicated user management module
- Task comments
- File attachments
- Notifications
- Activity/audit logs
- Advanced reporting and analytics
- Real-time task notifications
- Search and advanced filtering
- Docker deployment
- CI/CD pipeline

---

# Planned User Invitation Flow

A future production version can allow administrators to invite new team members instead of requiring manual registration.

```text
Admin
  │
  ▼
Invite User
  │
  ▼
Enter Email + Role
  │
  ▼
Invitation Email
  │
  ▼
User Accepts Invitation
  │
  ▼
Sets Password
  │
  ▼
Account Activated
  │
  ▼
Admin Assigns Projects
  │
  ▼
Member Accesses Assigned Tasks
```

> User invitation is documented as a planned enhancement and is not currently implemented.

---

# Screenshots

Screenshots can be added here to demonstrate the main application interfaces.

## Login

_Add screenshot here._

## Admin Dashboard

_Add screenshot here._

## Projects

_Add screenshot here._

## Team Management

_Add screenshot here._

## Tasks

_Add screenshot here._

## Member Dashboard

_Add screenshot here._

---

# API Response Examples

## Project Created

```json
{
  "message": "Project created successfully.",
  "data": {
    "id": 4,
    "name": "Team Task Manager",
    "description": "Assessment project",
    "status": "active"
  }
}
```

## Task Created

```json
{
  "message": "Task created successfully.",
  "data": {
    "id": 1,
    "project_id": 4,
    "assigned_to": 2,
    "title": "Build Login Page",
    "status": "todo",
    "priority": "high"
  }
}
```

## Unauthorized Request

```json
{
  "message": "Forbidden. Admin access required."
}
```

---

# Development Notes

The application follows a separated frontend/backend architecture:

```text
React Frontend
      │
      │ Axios
      ▼
Laravel REST API
      │
      │ Eloquent ORM
      ▼
MySQL Database
```

This separation makes it possible to independently develop and deploy the frontend and backend.

---

# Git Repository

The project is maintained as a single repository containing both applications:

```text
team-task-manager
│
├── team-task-manager-backend
└── team-task-manager-frontend
```

Repository:

https://github.com/Keshavpal22/team-task-manager

---

# Author

**Keshav Pal**

GitHub:

https://github.com/Keshavpal22

---

# License

This project was developed as a full-stack application/assessment project.
