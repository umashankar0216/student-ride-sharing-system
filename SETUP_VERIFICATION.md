# Setup & Verification Checklist

## ✅ Pre-Setup Requirements

- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Backend API running on http://localhost:8080
- [ ] Backend database (Supabase PostgreSQL) configured
- [ ] Git (optional, for version control)

## 📦 Step 1: Installation

```bash
# Navigate to frontend folder
cd "student ride sharing(frontend)"

# Install all dependencies
npm install

# Wait for installation to complete (takes 1-2 minutes)
```

**Expected Output:**
```
added XXX packages in Xs
```

## ⚙️ Step 2: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env.local

# Verify .env.local was created
cat .env.local
```

**Expected Content:**
```
VITE_API_BASE_URL=http://localhost:8080/api
```

> ⚠️ **Note**: If your backend runs on a different port, update this value

## 🚀 Step 3: Start Development Server

```bash
# Start the frontend development server
npm run dev
```

**Expected Output:**
```
  VITE v8.0.10  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## 🌐 Step 4: Open in Browser

- [ ] Open browser (Chrome, Firefox, Safari, Edge)
- [ ] Navigate to `http://localhost:5173`
- [ ] Should see login page

## 🧪 Step 5: Test Registration

### Create Student Account
- [ ] Click "Sign up here" link
- [ ] Fill registration form:
  - Full Name: `Test Student`
  - Username: `teststudent`
  - Email: `student@test.com`
  - Password: `password123`
  - Confirm Password: `password123`
- [ ] Click "Create Account"
- [ ] See success message
- [ ] Redirected to login page

## 🔓 Step 6: Test Login (Student)

- [ ] Enter credentials:
  - Email/Username: `student@test.com` or `teststudent`
  - Password: `password123`
  - Role: **Student**
- [ ] Click "Log In"
- [ ] Redirected to `/student/dashboard`
- [ ] See dashboard header: "Welcome, student@test.com"

## ✍️ Step 7: Test Submit Ride Request

- [ ] Click "Submit Ride Request" tab
- [ ] Fill form:
  - **From**: `Main Campus`
  - **To**: `City Center`
  - **Date & Time**: Set to tomorrow at 2:30 PM
  - **Vehicle**: `ANY`
- [ ] Click "Submit Request"
- [ ] See success message: "Ride request submitted successfully!"
- [ ] Form clears

## 🔑 Step 8: Login as Driver

- [ ] Click logout button (top-right)
- [ ] Should see login form
- [ ] Enter credentials:
  - Email/Username: `student@test.com`
  - Password: `password123`
  - Role: **Driver** ← Change this!
- [ ] Click "Log In"
- [ ] Redirected to `/driver/dashboard`

## 👀 Step 9: View Demand Groups

- [ ] Should see "Available Ride Opportunities" heading
- [ ] Should see demand card(s) showing:
  - Route: "Main Campus → City Center"
  - Vehicle: Badge showing vehicle type
  - Time slot: Matching your request time
  - Student count: "1 students interested"

## 🚗 Step 10: Create Ride from Demand

- [ ] Click "Create Ride" button on demand card
- [ ] Modal appears with form:
  - Source: `Main Campus` (pre-filled)
  - Destination: `City Center` (pre-filled)
  - Vehicle Type: Select `Car (4-5 seats)`
  - Total Seats: `4` (minimum is 1)
  - Departure Time: Pre-filled with demand time
- [ ] Click "Create Ride"
- [ ] See success message

## 📋 Step 11: Verify Auto-Booking

- [ ] Logout from driver view
- [ ] Login as student again
- [ ] Click "My Bookings" tab
- [ ] Should see your booking listed (future enhancement)

## 🔍 Step 12: Test Search Rides

- [ ] Login as student (if not already)
- [ ] Click "Search Rides" tab
- [ ] Fill search form:
  - **From**: `Main Campus`
  - **To**: `City Center`
  - **Date & Time**: Tomorrow 2:30 PM
  - **Vehicle Type**: `ANY`
- [ ] Click "Search Rides"
- [ ] Should see ride card(s) with available seats

## 📱 Step 13: Test Responsive Design

- [ ] Open browser DevTools (F12)
- [ ] Click device toolbar (Ctrl+Shift+M)
- [ ] Test on different screen sizes:
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1200px)
- [ ] Check that layout adjusts properly
- [ ] Buttons and forms remain usable

## 🐛 Step 14: Test Error Handling

### Test Invalid Login
- [ ] Click logout
- [ ] Try login with wrong password
- [ ] Should see error message

### Test Form Validation
- [ ] Try to submit empty form
- [ ] Should see validation errors

### Test Disabled States
- [ ] Try booking when no seats available
- [ ] Button should be disabled

## 🔧 Debugging Commands

If you encounter issues, try these:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Open DevTools → Application → Clear Site Data

# Check localhost is accessible
# Open http://localhost:8080/api/auth/login in browser
# Should show error (no GET method), but means API is accessible
```

## 📊 Verification Checklist

### Frontend
- [ ] npm install succeeded
- [ ] .env.local created with correct API URL
- [ ] `npm run dev` starts successfully
- [ ] Browser loads http://localhost:5173
- [ ] No errors in browser console (F12)

### Registration & Authentication
- [ ] Can register new account
- [ ] Can login with email
- [ ] Can login with username
- [ ] Role selector works (Student/Driver)
- [ ] JWT token stored in localStorage
- [ ] Protected routes require login

### Student Features
- [ ] Can submit ride request
- [ ] Can search rides
- [ ] Can book rides
- [ ] Form validation works
- [ ] Success messages display

### Driver Features
- [ ] Can view demand groups
- [ ] Can see student count
- [ ] Can create rides
- [ ] Modal opens correctly
- [ ] Rides created successfully

### UI/UX
- [ ] Responsive design works
- [ ] No layout breaks on mobile
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Navigation smooth
- [ ] Buttons have hover effects

## ⚠️ Common Issues & Solutions

### Issue: "API Error: Connection refused"
**Solution**: Ensure backend is running on port 8080
```bash
# Check backend is running
curl http://localhost:8080/api/auth/login
```

### Issue: "Cannot find module 'react-router-dom'"
**Solution**: Dependencies not installed
```bash
npm install
```

### Issue: "Blank page after login"
**Solution**: Check browser console (F12) for errors
- Verify `.env.local` API URL is correct
- Clear localStorage: `localStorage.clear()`
- Restart `npm run dev`

### Issue: "CORS error"
**Solution**: Backend doesn't have CORS enabled
- Backend should have `@CrossOrigin(origins = "*")`
- Verify all controllers have this annotation

### Issue: "Form submit doesn't work"
**Solution**: 
- Check browser console for errors (F12)
- Verify API endpoint in Network tab
- Ensure backend is accepting requests

## 📈 Performance Check

### Page Load Times
- [ ] Login page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Form submission completes in < 2 seconds

### Browser DevTools
- [ ] No critical errors in console
- [ ] Network requests complete successfully
- [ ] No missing resources (404 errors)

## 🎓 Next Steps After Verification

1. **Explore the Code**
   - Review `src/App.jsx` for routing
   - Check `src/context/AuthContext.jsx` for auth flow
   - Look at API calls in `src/api/apiClient.js`

2. **Customize**
   - Change theme colors in `src/styles/global.css`
   - Update branding in `Navigation.jsx`
   - Add your logo to public folder

3. **Deploy**
   - Build: `npm run build`
   - Deploy `dist/` folder to hosting

4. **Add Features**
   - Real-time notifications with WebSocket
   - Map integration
   - Payment system
   - User profiles

## 📚 Documentation Reference

- **FRONTEND_README.md** - Comprehensive frontend guide
- **SYSTEM_ANALYSIS.md** - Full system architecture
- **QUICK_START.md** - Quick setup guide
- **IMPLEMENTATION_SUMMARY.md** - What was built

## ✅ Final Checklist

- [ ] All installation steps completed
- [ ] Environment configured (.env.local created)
- [ ] Development server running (npm run dev)
- [ ] Browser shows login page (localhost:5173)
- [ ] Can register and login
- [ ] Can submit ride request
- [ ] Can view demand groups
- [ ] Can create rides
- [ ] No console errors
- [ ] Responsive design works
- [ ] Read all documentation
- [ ] Ready to deploy!

## 🎉 You're All Set!

Your Student Ride Sharing frontend is now **fully functional and ready for use**.

For questions or issues, refer to:
1. Browser console (F12) for errors
2. Backend logs for API issues
3. Documentation files for guidance
4. GitHub issues (if using version control)

**Happy coding! 🚀**
