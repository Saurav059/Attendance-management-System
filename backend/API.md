# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register HR Admin
**POST** `/auth/register`

Create a new HR admin account.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@company.com",
  "createdAt": "2026-02-07T06:30:00.000Z"
}
```

### Login
**POST** `/auth/login`

Authenticate HR admin and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com"
  }
}
```

---

## Employees

All employee endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Get All Employees
**GET** `/employees`

Retrieve all employees.

**Response:**
```json
[
  {
    "id": "uuid",
    "employeeId": "EMP001",
    "name": "John Doe",
    "role": "Software Engineer",
    "department": "Engineering",
    "hourlyRate": 50,
    "createdAt": "2026-02-07T06:30:00.000Z",
    "updatedAt": "2026-02-07T06:30:00.000Z"
  }
]
```

### Get Employee by ID
**GET** `/employees/:id`

Retrieve a specific employee.

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "EMP001",
  "name": "John Doe",
  "role": "Software Engineer",
  "department": "Engineering",
  "hourlyRate": 50,
  "createdAt": "2026-02-07T06:30:00.000Z",
  "updatedAt": "2026-02-07T06:30:00.000Z"
}
```

### Create Employee
**POST** `/employees`

Create a new employee.

**Request Body:**
```json
{
  "employeeId": "EMP004",
  "name": "Alice Johnson",
  "role": "Marketing Manager",
  "department": "Marketing",
  "hourlyRate": 55
}
```

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "EMP004",
  "name": "Alice Johnson",
  "role": "Marketing Manager",
  "department": "Marketing",
  "hourlyRate": 55,
  "createdAt": "2026-02-07T06:30:00.000Z",
  "updatedAt": "2026-02-07T06:30:00.000Z"
}
```

### Update Employee
**PATCH** `/employees/:id`

Update an existing employee.

**Request Body:**
```json
{
  "name": "Alice Smith",
  "hourlyRate": 60
}
```

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "EMP004",
  "name": "Alice Smith",
  "role": "Marketing Manager",
  "department": "Marketing",
  "hourlyRate": 60,
  "createdAt": "2026-02-07T06:30:00.000Z",
  "updatedAt": "2026-02-07T06:30:00.000Z"
}
```

### Delete Employee
**DELETE** `/employees/:id`

Delete an employee.

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "EMP004",
  "name": "Alice Smith",
  "role": "Marketing Manager",
  "department": "Marketing",
  "hourlyRate": 60
}
```

---

## Attendance

### Clock In
**POST** `/attendance/clock-in`

Record employee clock-in time.

**Request Body:**
```json
{
  "employeeId": "EMP001"
}
```

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "clockInTime": "2026-02-07T09:00:00.000Z",
  "clockOutTime": null,
  "totalHours": null,
  "status": "PRESENT"
}
```

### Clock Out
**POST** `/attendance/clock-out`

Record employee clock-out time and calculate total hours.

**Request Body:**
```json
{
  "employeeId": "EMP001"
}
```

**Response:**
```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "clockInTime": "2026-02-07T09:00:00.000Z",
  "clockOutTime": "2026-02-07T17:00:00.000Z",
  "totalHours": 8,
  "status": "PRESENT"
}
```

### Get All Attendance Records
**GET** `/attendance`

Retrieve all attendance records (requires authentication).

**Response:**
```json
[
  {
    "id": "uuid",
    "employeeId": "uuid",
    "employee": {
      "name": "John Doe",
      "employeeId": "EMP001"
    },
    "clockInTime": "2026-02-07T09:00:00.000Z",
    "clockOutTime": "2026-02-07T17:00:00.000Z",
    "totalHours": 8,
    "status": "PRESENT"
  }
]
```

---

## Reports

All report endpoints require JWT authentication.

### Daily Report
**GET** `/reports/daily?date=2026-02-07`

Get attendance report for a specific date.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "date": "2026-02-07",
  "totalEmployees": 3,
  "present": 2,
  "absent": 1,
  "attendances": [
    {
      "employee": {
        "name": "John Doe",
        "employeeId": "EMP001"
      },
      "clockInTime": "2026-02-07T09:00:00.000Z",
      "clockOutTime": "2026-02-07T17:00:00.000Z",
      "totalHours": 8
    }
  ]
}
```

### Employee Report
**GET** `/reports/employee/:employeeId`

Get attendance history for a specific employee.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

**Response:**
```json
{
  "employee": {
    "name": "John Doe",
    "employeeId": "EMP001",
    "department": "Engineering"
  },
  "totalDays": 20,
  "totalHours": 160,
  "averageHours": 8,
  "attendances": [
    {
      "clockInTime": "2026-02-07T09:00:00.000Z",
      "clockOutTime": "2026-02-07T17:00:00.000Z",
      "totalHours": 8,
      "status": "PRESENT"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Employee not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```
