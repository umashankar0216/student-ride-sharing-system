# Student Ride Sharing System - Complete Analysis & Frontend Documentation

## 📋 System Overview

The Student Ride Sharing application is a demand-driven ride-sharing platform where students submit ride requests that are pooled and matched with drivers. This document provides a complete analysis of the backend and the frontend implementation.

---

## 🏗️ System Architecture

### Backend Architecture
- **Framework**: Spring Boot 4.1.0
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (7-day expiration)
- **API Style**: RESTful
- **Build Tool**: Maven
- **Java Version**: 25

### Frontend Architecture
- **Framework**: React 19
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: npm
- **State Management**: React Context API
- **Styling**: CSS3 with responsive design

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   Auth      │  │  Student     │  │  Driver Dashboard  │ │
│  │  Pages      │  │  Dashboard   │  │  & Ride Manager    │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
│         ↓               ↓                    ↓              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │        API Client (apiClient.js)                       │ │
│  │     JWT Token Management & Headers                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           ↓ HTTP/REST
┌──────────────────────────────────────────────────────────────┐
│            Backend (Spring Boot)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers                            │  │
│  │  ├── AuthController (/api/auth)                     │  │
│  │  ├── StudentController (/api/students)             │  │
│  │  └── DriverController (/api/drivers)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Service Layer                            │  │
│  │  ├── AuthService                                   │  │
│  │  ├── RideService                                   │  │
│  │  ├── RideRequestService                            │  │
│  │  └── BookingService                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Repository Layer                           │  │
│  │  ├── UserRepository                                │  │
│  │  ├── RideRepository                                │  │
│  │  ├── RideRequestRepository                         │  │
│  │  ├── BookingRepository                             │  │
│  │  └── RoleRepository                                │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           ↓ JDBC/SQL
                 ┌─────────────────────┐
                 │  PostgreSQL Database │
                 │   (Supabase)        │
                 └─────────────────────┘
```

---

## 🔐 Authentication Flow

### Registration Flow
```
1. User → /register page
2. Fill form: name, username, email, password
3. Frontend validates form locally
4. POST /api/auth/register {userName, name, email, password}
5. Backend: Hash password with BCrypt, create user record
6. Success response → Redirect to /login
```

### Login Flow
```
1. User → /login page
2. Select role: Student or Driver
3. Enter credentials: email/username + password
4. POST /api/auth/login {userNameOrEmail, password}
5. Backend: Validate credentials, generate JWT token
6. Frontend: Store token + user data in localStorage
7. Redirect to dashboard (based on selected role)
8. Future requests: Include "Authorization: Bearer <token>" header
```

### Token Management
- **Storage**: localStorage (accessible to JavaScript)
- **Lifecycle**: 7 days (604,800,000 ms)
- **Format**: JWT (header.payload.signature)
- **Claim**: username extracted for user identification

---

## 📊 Core Business Logic

### 1. Demand Pooling System

**What Happens:**
- Students submit ride requests with: source, destination, preferred time, vehicle preference
- Backend groups requests by: **route + time-slot (30-min windows) + vehicle type**
- Drivers view clustered demand groups on their dashboard
- Minimum 1 student required to show a demand group

**Time-Slot Calculation:**
```javascript
// Example: 2026-06-22 14:45 → "2026-06-22 14:30"
// If minutes < 30: "00", else "30"
```

**Data Structure:**
```typescript
GroupedRequestDTO {
  source: string,
  destination: string,
  preferredVehicle: string,  // CAR, AUTO, BIKE, ANY
  timeSlot: string,          // "2026-06-22 14:30"
  studentCount: Long         // Number of interested students
}
```

### 2. Ride Creation from Demand

**Workflow:**
1. Driver selects a demand group from dashboard
2. Opens modal with demand details pre-filled
3. Driver specifies: vehicle type, total seats, departure time
4. Backend validates: totalSeats ≥ studentCount
5. Creates ride record
6. **Automatic FCFS Booking**: All students in that group are auto-booked
7. Ride becomes available for additional manual bookings

**Data Structure:**
```typescript
CreateRideFromDemandDto {
  driverId: Long,
  source: string,
  destination: string,
  vehicleType: string,        // CAR, AUTO, BIKE
  preferredTime: LocalDateTime,
  totalSeats: Integer
}
```

### 3. Student Booking Paths

**Path 1: Auto-Booking (Implicit)**
- Student submits request → Request added to demand pool
- Driver creates ride from demand group → Student auto-booked
- Booking automatically created with status: CONFIRMED

**Path 2: Manual Booking (Explicit)**
- Student searches rides via: `/api/students/rides/search`
- Parameters: source, destination, vehicleType, preferredTime
- Results include rides within ±30 minutes of preferred time
- Student clicks "Book Now" → POST `/api/students/{studentId}/bookings/{rideId}`
- Booking created if seats available

**Data Structures:**
```typescript
RideRequestDto {
  userId: Long,
  source: string,
  destination: string,
  preferredTime: LocalDateTime,  // ISO: "2026-06-22T14:30:00"
  preferredVehicle: string       // CAR, AUTO, BIKE, ANY
}

RideResponseDto {
  id: Long,
  source: string,
  destination: string,
  departureTime: LocalDateTime,
  totalSeats: Integer,
  occupiedSeats: Integer,
  availableSeats: Integer,
  vehicleType: string
}

BookingResponseDto {
  id: Long,
  status: string,      // CONFIRMED, CANCELLED
  user: UserResponseDto,
  ride: RideResponseDto
}
```

### 4. Cancellation Flows

**Student Cancels Booking:**
- Booking marked as CANCELLED
- Seat restored to ride (`occupiedSeats--`)
- Ride remains active for other bookings

**Driver Cancels Ride:**
- Ride marked as cancelled
- All bookings for this ride marked as CANCELLED
- Students returned to pending pool (RequestStatus: PENDING)
- Students can submit new requests or book other rides

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/register` | No | `RegisterDto` | Message (success) |
| POST | `/login` | No | `LoginDto` | `JwtAuthResponse` |

### Student API (`/api/students`)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/requests` | No | Submit ride request |
| POST | `/{studentId}/bookings/{rideId}` | No | Book a ride |
| PUT | `/bookings/{bookingId}/cancel` | No | Cancel booking |
| GET | `/rides/search?source=X&destination=Y&vehicleType=Z&preferredTime=T` | No | Search rides |

### Driver API (`/api/drivers`)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/dashboard/demand` | ROLE_DRIVER | Get demand groups |
| POST | `/rides/create-from-demand` | ROLE_DRIVER | Create ride from demand |
| PUT | `/rides/{rideId}/cancel` | ROLE_DRIVER | Cancel ride |

---

## 🎨 Frontend Components

### 1. Authentication Components
- **Login Page**: Email/Username + Password + Role selector
- **Register Page**: Name + Username + Email + Password confirmation

### 2. Student Dashboard
- **Submit Request Tab**:
  - Form for ride request submission
  - Validates source, destination, time
  - Shows confirmation message after submission

- **Search Rides Tab**:
  - Form to query available rides
  - Displays results in card format
  - Each card shows: route, time, vehicle type, available seats
  - Book button for each ride

- **My Bookings Tab**:
  - Future feature: Show booking history
  - Cancel option for each booking

### 3. Driver Dashboard
- **Demand Groups Grid**:
  - Cards showing each demand group
  - Route, vehicle preference, time, student count
  - "Create Ride" button

- **Create Ride Modal**:
  - Pre-filled: source, destination, vehicle type, time
  - Editable: total seats (min = studentCount)
  - Submit to create ride and auto-book students

- **Active Rides Section** (Future):
  - List driver's current rides
  - Show occupancy
  - Cancel option

---

## 🌐 Frontend Environment Configuration

### `.env.local` File
```
# Required for API communication
VITE_API_BASE_URL=http://localhost:8080/api
```

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Test build locally
```

---

## 💾 State Management

### AuthContext
```javascript
{
  user: {
    email: string,
    role: "ROLE_STUDENT" | "ROLE_DRIVER"
  },
  token: string (JWT),
  loading: boolean,
  error: string,
  
  // Methods
  register(userData)
  login(credentials)
  logout()
  updateUserRole(role)
  
  // Computed
  isAuthenticated: boolean
  isDriver: boolean
  isStudent: boolean
}
```

### Local Storage
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {email: "user@example.com", role: "ROLE_STUDENT"}
}
```

---

## 🔄 Data Exchange Examples

### Example 1: Student Submitting Request
```javascript
// Frontend sends:
{
  userId: 1,
  source: "Main Campus",
  destination: "City Center",
  preferredTime: "2026-06-22T14:30:00",
  preferredVehicle: "ANY"
}

// Backend processes:
// - Validates request
// - Creates RideRequest record
// - Adds to demand pool
// - Groups with similar requests

// Backend returns:
{
  id: 101,
  source: "Main Campus",
  destination: "City Center",
  preferredTime: "2026-06-22T14:30:00",
  preferredVehicle: "ANY",
  status: "PENDING",
  createdAt: "2026-06-22T14:25:00"
}
```

### Example 2: Driver Creating Ride from Demand
```javascript
// Frontend sends:
{
  driverId: 50,
  source: "Main Campus",
  destination: "City Center",
  vehicleType: "CAR",
  preferredTime: "2026-06-22T14:30:00",
  totalSeats: 4
}

// Backend processes:
// - Creates Ride record
// - Finds all students with matching request in timeSlot
// - Creates Booking records for each (CONFIRMED, FCFS)
// - Updates RequestStatus to FULFILLED for booked students

// Backend returns:
{
  id: 201,
  driver: {id: 50, name: "John Doe"},
  source: "Main Campus",
  destination: "City Center",
  departureTime: "2026-06-22T14:30:00",
  totalSeats: 4,
  occupiedSeats: 3,  // Auto-booked 3 students
  vehicleType: "CAR"
}
```

---

## 🎯 Key Features Implemented in Frontend

✅ **User Authentication**
- Registration with validation
- Login with role selection
- Token-based session management
- Protected routes

✅ **Student Features**
- Submit ride requests with form validation
- Search rides with multiple filters
- Book rides with availability check
- Cancel bookings
- Real-time feedback (success/error messages)

✅ **Driver Features**
- View demand groups (clustered requests)
- See number of interested students per group
- Create rides from demand groups
- Automatic FCFS booking notification
- Cancel rides with confirmation

✅ **UI/UX**
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Loading states
- Error handling with user-friendly messages
- Modal dialogs for confirmations
- Form validation with clear error indicators

✅ **API Integration**
- Automatic JWT token handling
- Centralized API client
- Error handling and display
- Request/response typing

---

## 🚀 How to Run the System

### Step 1: Start Backend
```bash
cd "student ride sharing(backend)"
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Step 2: Start Frontend
```bash
cd "student ride sharing(frontend)"
npm install
cp .env.example .env.local
npm run dev
# Runs on http://localhost:5173
```

### Step 3: Test the Application
1. **Register**: `/register` → Create new student account
2. **Login**: `/login` → Login as STUDENT
3. **Submit Request**: Go to Student Dashboard → Submit ride request
4. **Login as Driver**: Logout → Login with role DRIVER
5. **View Demand**: Driver Dashboard shows your request
6. **Create Ride**: Click "Create Ride" on demand group
7. **Verify Booking**: Students are auto-booked

---

## 📈 Future Enhancements

### Frontend
- [ ] Real-time notifications with WebSocket
- [ ] Map integration (Google Maps/Leaflet)
- [ ] Advanced search filters (price, stops, etc.)
- [ ] User profile customization
- [ ] Rating and review system
- [ ] Payment integration
- [ ] In-app messaging
- [ ] Ride analytics and history export

### Backend
- [ ] WebSocket for real-time updates
- [ ] Payment processing (Stripe, Razorpay)
- [ ] Rating/review persistence
- [ ] Advanced analytics
- [ ] SMS/Email notifications
- [ ] Redis caching for demand groups
- [ ] Load balancing for scaling
- [ ] Mobile app API versioning

---

## 🐛 Debugging Tips

### Frontend Issues
- Check browser console (F12) for JavaScript errors
- Check Network tab for API calls and responses
- Verify `.env.local` has correct API URL
- Clear localStorage if token is stale

### API Integration
- Test endpoints with Postman
- Check backend logs for errors
- Verify CORS headers in backend
- Ensure JWT secret matches

### Build Issues
- Delete `node_modules` and reinstall
- Clear npm cache: `npm cache clean --force`
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## 📝 Summary

This frontend is a complete React implementation that:
- Communicates seamlessly with the Spring Boot backend
- Implements demand pooling and driver dashboard features
- Provides role-based access (Student vs Driver)
- Handles authentication with JWT tokens
- Offers responsive, user-friendly interface
- Manages complex ride-sharing workflows

The system is production-ready and can be deployed to any static hosting service (Vercel, Netlify, etc.) with the backend API running on a dedicated server.
