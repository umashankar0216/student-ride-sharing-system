# Quick Start Guide - Student Ride Sharing Frontend

## 🎯 5-Minute Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Backend API running (http://localhost:8080)

### Installation

1. **Navigate to frontend folder**
   ```bash
   cd "student ride sharing(frontend)"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Login page will load automatically

## 🎮 Testing the Application

### Test Scenario 1: Student Submitting Request

1. **Register as Student**
   - Go to `http://localhost:5173/register`
   - Fill form: Name, Username, Email, Password
   - Click "Create Account"

2. **Login as Student**
   - Navigate to `/login`
   - Enter credentials
   - Select "Student" role
   - Click "Log In"

3. **Submit Ride Request**
   - Click "Submit Ride Request" tab
   - Fill form:
     - From: "Main Campus"
     - To: "City Center"
     - Date/Time: Tomorrow at 2:30 PM
     - Vehicle: "ANY"
   - Click "Submit Request"
   - Success message will appear

### Test Scenario 2: Driver Viewing Demand & Creating Ride

1. **Login as Driver (Same Account)**
   - Logout from Student view
   - Login again, but select "Driver" role
   - Click "Log In"

2. **View Demand Groups**
   - Driver Dashboard shows demand groups
   - Your submitted request appears as a group

3. **Create Ride**
   - Click "Create Ride" button on demand group
   - Modal appears with pre-filled details
   - Modify seats if needed (minimum = student count)
   - Click "Create Ride"
   - Success notification appears

4. **Verify Auto-Booking**
   - Logout and login as Student again
   - Go to "My Bookings" tab
   - Your booking should show as CONFIRMED

## 📂 File Structure After Setup

```
student ride sharing(frontend)/
├── src/
│   ├── api/
│   │   └── apiClient.js          # API communication
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication
│   ├── pages/
│   │   ├── Auth.jsx              # Login/Register
│   │   ├── StudentDashboard.jsx
│   │   └── DriverDashboard.jsx
│   ├── components/
│   │   ├── Navigation.jsx
│   │   └── UI.jsx
│   ├── styles/
│   │   ├── global.css
│   │   ├── auth.css
│   │   ├── student.css
│   │   └── driver.css
│   ├── App.jsx                   # Main app
│   ├── main.jsx                  # Entry point
│   └── index.css
├── public/
├── .env.local                    # Environment variables
├── vite.config.js
├── package.json
└── FRONTEND_README.md
```

## 🔑 Key Endpoints to Test

### Authentication
```bash
POST http://localhost:8080/api/auth/register
POST http://localhost:8080/api/auth/login
```

### Student Endpoints
```bash
POST http://localhost:8080/api/students/requests
GET http://localhost:8080/api/students/rides/search
POST http://localhost:8080/api/students/{studentId}/bookings/{rideId}
PUT http://localhost:8080/api/students/bookings/{bookingId}/cancel
```

### Driver Endpoints
```bash
GET http://localhost:8080/api/drivers/dashboard/demand
POST http://localhost:8080/api/drivers/rides/create-from-demand
PUT http://localhost:8080/api/drivers/rides/{rideId}/cancel
```

## 🔧 Available npm Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🚀 Deployment

### Build & Deploy

1. **Build production version**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm run preview
   ```

3. **Deploy `dist/` folder to hosting**
   - Vercel: `vercel deploy dist/`
   - Netlify: Drag and drop `dist/` folder
   - GitHub Pages: Push to gh-pages branch

### Environment Variables for Production
Update `.env.local` before building:
```
VITE_API_BASE_URL=https://your-backend-api.com/api
```

## 🆘 Troubleshooting

### Issue: "Cannot GET /student/dashboard"
**Solution**: Check that you're logged in and JWT token is valid

### Issue: "API Error 403 Forbidden"
**Solution**: 
- Driver endpoints require ROLE_DRIVER
- Ensure you logged in with correct role

### Issue: "Blank page after login"
**Solution**:
- Check browser console for errors (F12)
- Verify API URL in `.env.local`
- Clear localStorage: `localStorage.clear()`

### Issue: "Ride not created"
**Solution**:
- Ensure totalSeats ≥ studentCount
- Check backend logs for errors
- Verify database is accessible

### Issue: npm install fails
**Solution**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Files

1. **FRONTEND_README.md** - Complete frontend documentation
2. **SYSTEM_ANALYSIS.md** - Full system architecture & analysis
3. **.env.example** - Environment configuration template

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite Guide](https://vite.dev)
- [CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)

## ✨ Features Checklist

✅ User Registration
✅ User Login with Role Selection
✅ Student Dashboard
  ✅ Submit Ride Requests
  ✅ Search Available Rides
  ✅ Book Rides
  ✅ Cancel Bookings
✅ Driver Dashboard
  ✅ View Demand Groups
  ✅ Create Rides from Demand
  ✅ Cancel Rides
✅ JWT Authentication
✅ Protected Routes
✅ Responsive Design
✅ Error Handling
✅ Loading States
✅ Form Validation
✅ Modal Dialogs
✅ Card Components
✅ Alerts & Notifications

---

**Ready to go!** 🚀 Start the development server and test the application.
