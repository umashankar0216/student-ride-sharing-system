# Student Ride Sharing - Frontend

A modern React application for a student ride-sharing platform with demand pooling and driver management.

## 🚀 Features

### For Students
- **Submit Ride Requests**: Post your travel needs to the demand pool
- **Search Available Rides**: Find rides matching your criteria
- **Book Rides**: Manually book seats on available rides
- **Manage Bookings**: Track and cancel your bookings
- **Auto-booking**: Automatic booking when drivers accept your demand group

### For Drivers
- **Dashboard**: View clustered demand groups by route and time
- **Create Rides**: Accept demand groups and create rides with specified seat count
- **Manage Rides**: View and cancel active rides
- **Smart Grouping**: See number of interested students per demand group
- **FCFS Booking**: Automatic first-come-first-served booking for ride creation

## 🛠️ Tech Stack

- **React 19**: Modern UI framework
- **React Router v6**: Client-side routing
- **Vite**: Fast build tool and dev server
- **CSS3**: Responsive styling with custom themes

## 📦 Installation

1. **Clone the repository** (if using version control)
   ```bash
   cd "student ride sharing(frontend)"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Authentication

### Role-Based Access
- **Student Role**: Access student dashboard for ride requests and bookings
- **Driver Role**: Access driver dashboard for demand management and ride creation

### Login Flow
1. Navigate to `/login`
2. Enter credentials (email/username and password)
3. Select role (Student or Driver)
4. Successfully authenticated users are redirected to their respective dashboards

### Sign Up
1. Navigate to `/register`
2. Fill in the registration form
3. Create account with username, email, and password
4. Redirect to login and proceed with authentication

## 📁 Project Structure

```
src/
├── api/
│   └── apiClient.js          # API client with auth token handling
├── context/
│   └── AuthContext.jsx       # Authentication and state management
├── pages/
│   ├── Auth.jsx              # Login and Register pages
│   ├── StudentDashboard.jsx  # Student features
│   └── DriverDashboard.jsx   # Driver features
├── components/
│   ├── Navigation.jsx        # Navigation bar and routing
│   └── UI.jsx                # Reusable UI components
├── styles/
│   ├── global.css            # Global styles and layout
│   ├── auth.css              # Authentication page styles
│   ├── student.css           # Student dashboard styles
│   ├── driver.css            # Driver dashboard styles
│   └── components.css        # Component-specific styles
├── App.jsx                   # Main app with routing
├── main.jsx                  # Entry point
└── index.css                 # Base styles
```

## 🎯 Key Components

### AuthContext
- Manages user authentication state
- Stores JWT token in localStorage
- Provides login, logout, and registration methods
- Tracks user role (Student/Driver)

### StudentDashboard
- **Submit Request Tab**: Create new ride requests
- **Search Rides Tab**: Find and book available rides
- **My Bookings Tab**: View booking history (future enhancement)

### DriverDashboard
- **Demand Groups**: Clustered student requests by route/time
- **Create Ride Modal**: Accept demand and specify ride details
- **Active Rides**: Manage and cancel created rides

### UI Components
- `Button`: Customizable button with variants
- `Input`: Form input with error handling
- `Select`: Dropdown selection
- `Card`: Reusable card container
- `Modal`: Dialog component
- `Alert`: Success/error/warning messages
- `Badge`: Status indicators
- `Loader`: Loading spinner

## 🔗 API Integration

All API calls are handled through `apiClient.js` which:
- Automatically includes JWT token in headers
- Manages base URL configuration
- Handles error responses
- Provides typed methods for each endpoint

### Available APIs
- **Auth**: Register, Login
- **Student**: Create Request, Search Rides, Book Ride, Cancel Booking
- **Driver**: Get Dashboard Demand, Create Ride from Demand, Cancel Ride

## 🎨 Styling

- Responsive design with mobile-first approach
- CSS Grid and Flexbox for layouts
- CSS Variables for theming:
  - Primary: #3498db
  - Success: #27ae60
  - Danger: #e74c3c
  - Neutrals: #2c3e50, #ecf0f1, etc.

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🚨 Error Handling

- Form validation before submission
- API error messages displayed to users
- Token expiration handling (redirect to login)
- Network error alerts

## 🔮 Future Enhancements

- [ ] Real-time notifications for ride updates
- [ ] Map integration for route visualization
- [ ] Payment integration
- [ ] User profile and preferences
- [ ] Rating and review system
- [ ] Ride history and analytics
- [ ] In-app messaging between students and drivers
- [ ] Advanced search filters
- [ ] Booking history export

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend server is running
- Check `VITE_API_BASE_URL` in `.env.local`
- Verify CORS is enabled on backend

### Authentication Problems
- Clear browser localStorage
- Check token expiration
- Verify credentials are correct

### Build Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

## 📝 Build & Deployment

### Build for Production
```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deployment
The `dist/` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 📄 License

This project is part of the Student Ride Sharing system.

## 🤝 Contributing

For issues or improvements, please follow the project's contribution guidelines.

---

**Note**: Ensure the backend API is running and accessible before starting the frontend development server.
