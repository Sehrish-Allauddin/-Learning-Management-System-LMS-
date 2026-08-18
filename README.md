# LMS — Learning Management System

A modern and secure **Learning Management System (LMS)** designed for employee learning, course management, assessments, progress tracking, digital certificates, reporting, analytics, and AI-assisted learner support.

The system provides separate **Learner** and **Admin** portals with a modern responsive interface, personalized learning features, secure authentication, email-based password recovery, and English/Urdu language support.

---

## 📌 Project Overview

The LMS is an employee learning and development platform that helps organizations manage digital learning activities in one place.

The platform allows employees to:

- Access and enroll in courses
- Track course and module progress
- Complete assessments
- Follow learning paths
- Receive personalized course recommendations
- Identify skill gaps
- View learning performance
- Earn digital certificates
- View achievements
- Participate in leaderboards
- Get help through the LMS Assistant

Administrators can:

- Manage employees
- Manage courses
- Manage learning paths
- Monitor course completion
- View analytics
- Generate reports
- Monitor regional performance
- Review audit logs
- Manage learning content

---

# 🚀 Features

## 👨‍🎓 Learner Portal

### 🔐 Authentication

- Secure employee login
- Employee ID based authentication
- Password authentication
- Password recovery
- JWT-based authentication
- Protected routes
- Secure logout
- SMTP email support

### 📊 Learning Dashboard

The learner dashboard provides an overview of the learner's activity and performance.

It includes:

- Ongoing courses
- Completed courses
- Enrolled courses
- Learning progress
- Completion rate
- Average assessment score
- Completed modules
- Modules in progress
- Learning hours
- Performance insights

### 📚 Course Management

Learners can:

- Browse available courses
- Enroll in courses
- Open enrolled courses
- View course modules
- Continue learning
- Complete modules
- Track course progress
- Take assessments

### 🛤️ Learning Paths

Learners can follow structured learning paths designed to guide them through related courses and skills.

### 🎯 Personalized Course Recommendations

The LMS provides personalized course recommendations based on learner activity and learning history.

Example recommendations include:

- Deep Learning
- Math for Data Science
- Data Visualization
- SQL
- Python

### 🧠 Skill Gap Recommendations

The system provides recommended skills based on learner performance and learning profile.

Examples:

- SQL
- Python
- Data Visualization

### 📈 Performance Insights

The learner dashboard can display:

- Predicted performance
- Average score
- Completion rate
- Completed modules
- Modules in progress
- Performance factors

### 🏆 Achievements

Learners can view achievements earned through their learning activities.

### 🥇 Leaderboard

The leaderboard allows learners to view learning performance and engagement rankings.

### 📜 Digital Certificates

Learners can receive digital certificates after successfully completing required courses.

Certificates can contain:

- Certificate title
- Learner name
- Course name
- Award date
- LMS identification

### 🤖 LMS Assistant

The LMS includes an integrated assistant to help learners understand and navigate the platform.

The LMS Assistant can provide guidance related to:

- Courses
- Profile management
- Learning activities
- LMS navigation
- General platform usage

### 👤 Profile Management

Learners can manage profile information such as:

- Full name
- Designation
- Profile picture

### 🌐 Language Support

The LMS supports:

- English
- Urdu

### 🎨 Theme Settings

Learners can use the available theme settings to personalize the interface.

---

# 👨‍💼 Admin Portal

The Admin Portal provides administrators with centralized management and monitoring tools.

## 📊 Admin Dashboard

The dashboard provides an overview of:

- Total employees
- Active courses
- Active users
- Course completions
- User registrations
- Popular courses
- Learning statistics

## 👥 User Management

Administrators can manage employee/user accounts and monitor user activity.

## 📚 Course Management

Administrators can:

- Create courses
- Manage courses
- Organize course content
- Monitor course activity
- Manage course-related information

## 🛤️ Learning Path Management

Administrators can create and manage structured learning paths for employees.

## 📈 Reports & Analytics

The Admin Portal provides analytics for:

- Course completion
- User registrations
- Popular courses
- Regional performance
- Learning progress
- Assessment performance
- Active users

## 🌎 Regional Performance

Administrators can view learning performance and course statistics across different regions.

## 📝 Audit Logs

The system provides audit logging for monitoring important system activities.

## 📄 Report Generation

Administrators can generate reports related to learning activities and performance.

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

## Backend

- Node.js
- Express.js
- REST APIs

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT Authentication
- Protected routes

## Email

- Nodemailer
- SMTP
- Gmail SMTP compatible configuration

## Development Tools

- npm
- Git
- GitHub
- Visual Studio Code

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │     Learner Portal   │
                    │     React + Vite     │
                    └───────────┬──────────┘
                                │
                                │ REST API
                                ▼
                    ┌──────────────────────┐
                    │      Express.js      │
                    │       Backend        │
                    └───────────┬──────────┘
                                │
                                │ Prisma ORM
                                ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │       Database       │
                    └──────────────────────┘
                                │
                                │
                    ┌───────────▼──────────┐
                    │      Admin Portal    │
                    │   Management &       │
                    │      Analytics       │
                    └──────────────────────┘
```

---

## 📸 Screenshots

### Login Page

![Login Page](Picture/login-page.png)

### Learner Dashboard

![Learner Dashboard](Picture/learner-dashboard.png)

### Recommended Courses

![Recommended Courses](Picture/recommended-courses.png)

### LMS Assistant

![LMS Assistant](Picture/lms-assistant.png)

### Certificate

![Certificate](Picture/certificate.png)

### Admin Dashboard

![Admin Dashboard](Picture/admin-dashboard.png)

### Admin Reports

![Admin Reports](Picture/admin-reports.png)


## 🔐 Login Page

![LMS Login Page](./Picture/login-page.png)

The login page provides secure employee authentication.

---

## 📊 Learner Dashboard

![Learner Dashboard](./Picture/learner-dashboard.png)

The learner dashboard displays learning progress, courses, performance insights, recommendations, and learning statistics.

---

## 🎯 Recommended Courses

![Recommended Courses](./Picture/recommended-courses.png)

The LMS provides personalized course recommendations based on learner activity and learning needs.

---

## 🤖 LMS Assistant

![LMS Assistant](./Picture/lms-assistant.png)

The LMS Assistant helps learners with LMS navigation, courses, profiles, and general platform usage.

---

## 📜 Certificate

![Digital Certificate](./Picture/certificate.png)

Learners can receive digital certificates after successfully completing required courses.

---

## 👨‍💼 Admin Dashboard

![Admin Dashboard](./Picture/admin-dashboard.png)

The Admin Dashboard provides an overview of users, courses, completions, and learning analytics.

---

## 📈 Admin Reports

![Admin Reports](./Picture/admin-reports.png)

Administrators can view learning reports, course completion statistics, regional performance, and other analytics.

---

# ⚙️ Configuration

## Frontend Environment

Create a `.env` file in the project root.

```env
VITE_API_URL=https://your-api-domain.example
```

The frontend uses `VITE_API_URL` as the backend API base URL.

---

## Backend Environment

Create:

```text
server/.env
```

Configure the required environment variables:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
FRONTEND_URL=https://your-frontend-domain.example

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### ⚠️ Security Notice

Never upload real `.env` files or secrets to GitHub.

Never publish:

- Database passwords
- PostgreSQL credentials
- JWT secrets
- SMTP passwords
- Gmail App Passwords
- API keys
- Private tokens

Use placeholder values in `.env.example` files.

---

# 📋 System Requirements

Recommended environment:

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL
- Git
- Modern web browser
- Internet connection for email functionality

---

# 📦 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Sehrish-Allauddin/-Learning-Management-System-LMS-.git
```

Move into the project directory:

```bash
cd -Learning-Management-System-LMS-
```

---

# 💻 Frontend Setup

From the project root:

```bash
npm install
```

Create the frontend `.env` file:

```env
VITE_API_URL=https://your-api-domain.example
```

Start the development server:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

---

# 🖥️ Backend Setup

Open a terminal and move into the server directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Push the Prisma schema to PostgreSQL:

```bash
npx prisma db push
```

Start the backend:

```bash
npm run start
```

---

# 🗄️ Database

The LMS uses:

```text
PostgreSQL
```

with:

```text
Prisma ORM
```

The database connection is configured through:

```env
DATABASE_URL
```

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/lms
```

Use your own secure PostgreSQL credentials.

---

# 🔐 Authentication

The LMS uses secure authentication to protect learner and administrator areas.

Authentication includes:

- Employee ID login
- Password authentication
- JWT authentication
- Protected routes
- Logout
- Password recovery

Administrator access should only be provided to authorized users.

---

# 📧 Email & Password Recovery

The backend supports SMTP email functionality.

Email functionality can be used for:

- Password recovery
- Password reset links
- Authentication-related notifications

Example Gmail SMTP configuration:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

For Gmail, use an appropriate App Password when required.

Never publish your SMTP password or App Password.

---

# 🔑 Password Reset Flow

The password recovery process follows this general flow:

```text
User selects "Forgot Password"
            ↓
User provides account information
            ↓
Backend generates reset link/token
            ↓
SMTP sends password reset email
            ↓
User opens reset link
            ↓
User creates a new password
            ↓
Password is updated
            ↓
User can log in again
```

---

# 🤖 LMS Assistant

The LMS Assistant provides learners with support related to:

- Course navigation
- Profile management
- Learning activities
- LMS features
- General system usage

---

# 📊 Analytics

The LMS provides analytics for monitoring learning activities.

Analytics include:

### User Registration

Tracks user registration activity.

### Popular Courses

Shows courses with higher learner activity.

### Course Completion

Provides course completion statistics.

### Regional Performance

Provides regional learning performance information.

### Active Users

Displays information about active learners.

---

# 📜 Certificates

The LMS provides digital certificates after successful course completion.

A certificate may contain:

```text
Certificate of Completion

Learner Name

Course Name

Award Date

LMS — Learning Management System
```

---

# 🎯 Personalized Learning

The LMS supports personalized learning through:

- Course recommendations
- Skill-gap recommendations
- Performance insights
- Learning progress tracking
- Learning paths

These features help learners identify areas for improvement and discover relevant learning content.

---

# 🌐 Localization

The application supports:

```text
English
Urdu
```

Users can switch between supported languages from the application interface.

---

# 📱 Responsive Interface

The LMS uses a modern dashboard-based interface designed for different screen sizes.

The interface includes:

- Navigation sidebar
- Header controls
- Dashboard cards
- Course cards
- Progress indicators
- Analytics panels
- Reports
- LMS Assistant
- Admin controls

---

# 📁 Project Structure

```text
lms-main/
│
├── 📁 Picture/
│   ├── 🖼️ admin-dashboard.png
│   ├── 🖼️ admin-reports.png
│   ├── 🖼️ certificate.png
│   ├── 🖼️ learner-dashboard.png
│   ├── 🖼️ lms-assistant.png
│   ├── 🖼️ login-page.png
│   └── 🖼️ recommended-courses.png
│
├── 📁 public/
│
├── 📁 server/
│   ├── 📁 middleware/
│   ├── 📁 prisma/
│   ├── 📁 routes/
│   ├── 📁 utils/
│   └── 📄 package.json
│
├── 📁 src/
│
├── 📄 .gitignore
├── 📄 LICENSE
├── 📄 README.md
├── 📄 requirements.txt
├── 📄 index.html
├── 📄 package.json
├── 📄 package-lock.json
└── 📄 vite.config.js
```

---

# 🚫 GitHub Security

The following files should never be committed:

```text
.env
server/.env
node_modules/
dist/
```

The `.gitignore` file is configured to prevent sensitive and generated files from being uploaded.

Always keep real credentials outside the Git repository.

---

# 🧪 Testing Checklist

Before deployment, test the following:

- Login
- Logout
- Password recovery
- SMTP email delivery
- Course enrollment
- Course progress
- Module completion
- Assessments
- Certificate generation
- Profile management
- LMS Assistant
- Admin dashboard
- User management
- Course management
- Learning paths
- Reports
- Analytics
- Language switching
- Theme settings

---

# 🚀 Production Deployment

Before deploying the LMS to production:

1. Configure PostgreSQL.
2. Configure environment variables.
3. Configure SMTP.
4. Configure the production API URL.
5. Build the frontend.
6. Deploy the backend.
7. Enable HTTPS.
8. Test authentication.
9. Test password recovery.
10. Test learner features.
11. Test administrator features.
12. Verify database connectivity.
13. Verify email delivery.

Production secrets should be stored using the hosting provider's environment-variable system.

---

# 🤝 Contribution

Contributions and improvements are welcome.

## Create a Feature Branch

```bash
git checkout -b feature/new-feature
```

## Make Changes

Update the project and test your changes.

## Commit Changes

```bash
git add .
git commit -m "Add new feature"
```

## Push Changes

```bash
git push origin feature/new-feature
```

Then create a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for complete license information.

---

# 👩‍💻 Project Information

**Project Name:** LMS — Learning Management System

**Project Type:** Employee Learning and Development Platform

**Main Portals:**

- Learner Portal
- Admin Portal

**Primary Technologies:**

- React
- Vite
- Node.js
- Express.js
- Prisma
- PostgreSQL
- JWT
- Nodemailer
- SMTP

---

# ⭐ Project Highlights

The LMS combines employee learning management with analytics, personalized learning, certification, and AI-assisted support.

### Key Highlights

- Modern LMS interface
- Learner Portal
- Admin Portal
- Secure employee authentication
- Password recovery
- Course management
- Learning paths
- Assessments
- Progress tracking
- Digital certificates
- Achievements
- Leaderboard
- Personalized course recommendations
- Skill-gap recommendations
- Performance insights
- LMS Assistant
- Admin analytics
- Regional performance reporting
- Audit logs
- SMTP email support
- English and Urdu language support
- Secure environment configuration

---

## 📌 Important

This repository contains the LMS source code and documentation.

Do not commit real passwords, database credentials, SMTP passwords, API keys, JWT secrets, or other private information to GitHub.


