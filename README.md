# Attendance Management System

A modern, full-stack attendance tracking system built with NestJS and React, featuring employee clock-in/out functionality, HR dashboard, and comprehensive reporting.

## 🚀 Features

- **Employee Kiosk**: Simple interface for employees to clock in/out using their employee ID
- **HR Dashboard**: Comprehensive admin panel for managing employees and viewing reports
- **Real-time Tracking**: Track attendance with automatic hour calculation
- **Reports**: Daily and employee-specific attendance reports
- **Secure Authentication**: JWT-based authentication for HR admins
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion

## 📋 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **SQLite** - Lightweight database (easily swappable for PostgreSQL/MySQL)
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Utility-first CSS
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update values as needed.

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed the database with initial data:
   ```bash
   npm run prisma:seed
   ```
   
   **Default credentials:**
   - Email: `admin@company.com`
   - Password: `admin123`

6. Start the development server:
   ```bash
   npm run start:dev
   ```
   
   Backend will run on `http://localhost:3000/api`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

## 📱 Usage

### Employee Kiosk
1. Navigate to `http://localhost:5173/`
2. Enter your employee ID (e.g., `EMP001`, `EMP002`, `EMP003`)
3. Click "Clock In" to start your shift
4. Click "Clock Out" to end your shift

### HR Dashboard
1. Navigate to `http://localhost:5173/login`
2. Login with admin credentials
3. Manage employees (add, edit, delete)
4. View attendance records and reports
5. Track employee hours and generate reports

## 🏗️ Project Structure

```
xitiz work/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.ts            # Database seed script
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── employees/         # Employee management
│   │   ├── attendance/        # Attendance tracking
│   │   ├── reports/           # Reporting module
│   │   ├── prisma/            # Prisma service
│   │   └── main.ts            # Application entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/               # API client
    │   ├── context/           # React context (Auth)
    │   ├── pages/             # Page components
    │   │   ├── Kiosk.tsx      # Employee kiosk
    │   │   ├── Login.tsx      # HR login
    │   │   └── Dashboard.tsx  # HR dashboard
    │   ├── App.tsx            # Main app component
    │   └── main.tsx           # Application entry point
    └── package.json
```

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation on all endpoints
- CORS configured for frontend origin
- Environment-based configuration

## 📦 Production Deployment

### Backend

1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Set production environment variables in `.env`:
   - Generate a secure `JWT_SECRET`
   - Update `DATABASE_URL` for production database
   - Set `FRONTEND_URL` to your production frontend URL
   - Set `PORT` as needed

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the production server:
   ```bash
   npm run start:prod
   ```

### Frontend

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

2. The `dist` folder contains the production-ready static files

3. Deploy to any static hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

4. Update `VITE_API_URL` in `.env` to point to your production backend

## 🧪 Testing

### Backend
```bash
cd backend
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Generate coverage report
```

### Frontend
```bash
cd frontend
npm run lint          # Run ESLint
npm run build         # Test production build
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"                    # Database connection
JWT_SECRET="your-super-secret-jwt-key"          # JWT secret key
PORT=3000                                        # Server port
FRONTEND_URL="http://localhost:5173"            # Frontend URL for CORS
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api          # Backend API URL
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author



---

For more information or support, please contact the development team.
