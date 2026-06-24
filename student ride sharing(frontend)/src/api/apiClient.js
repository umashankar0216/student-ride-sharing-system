// // API Client Configuration
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// // Retrieve token from localStorage
// const getToken = () => {
//   return localStorage.getItem('token');
// };

// // Set common headers with JWT token if available
// const getHeaders = () => {
//   const token = getToken();
//   const headers = {
//     'Content-Type': 'application/json',
//   };
  
//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }
  
//   return headers;
// };

// // Generic fetch wrapper
// const apiCall = async (endpoint, options = {}) => {
//   const url = `${API_BASE_URL}${endpoint}`;
//   const headers = getHeaders();
  
//   const response = await fetch(url, {
//     ...options,
//     headers: {
//       ...headers,
//       ...options.headers,
//     },
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ message: 'API Error' }));
//     throw new Error(error.message || `HTTP Error: ${response.status}`);
//   }

//   return response.json();
// };

// // Authentication APIs
// export const authAPI = {
//   register: (userData) =>
//     apiCall('/auth/register', {
//       method: 'POST',
//       body: JSON.stringify(userData),
//     }),

//   login: (credentials) =>
//     apiCall('/auth/login', {
//       method: 'POST',
//       body: JSON.stringify(credentials),
//     }),
// };

// // Student APIs
// export const studentAPI = {
//   // Submit a new ride request
//   createRideRequest: (rideRequestData) =>
//     apiCall('/students/requests', {
//       method: 'POST',
//       body: JSON.stringify(rideRequestData),
//     }),

//   // Search available rides
//   searchRides: (source, destination, vehicleType, preferredTime) =>
//     apiCall(
//       `/students/rides/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&vehicleType=${vehicleType}&preferredTime=${encodeURIComponent(preferredTime)}`,
//       {
//         method: 'GET',
//       }
//     ),

//   // Book a ride
//   bookRide: (studentId, rideId) =>
//     apiCall(`/students/${studentId}/bookings/${rideId}`, {
//       method: 'POST',
//     }),

//   // Cancel booking
//   cancelBooking: (bookingId) =>
//     apiCall(`/students/bookings/${bookingId}/cancel`, {
//       method: 'PUT',
//     }),
// };

// // Driver APIs
// export const driverAPI = {
//   // Get dashboard demand groups
//   getDashboardDemand: () =>
//     apiCall('/drivers/dashboard/demand', {
//       method: 'GET',
//     }),

//   // Get selected cluster details for a demand group
//   getClusterDetails: (source, destination, preferredVehicle, timeSlot) =>
//     apiCall(
//       `/drivers/demands/cluster-details?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&preferredVehicle=${encodeURIComponent(preferredVehicle)}&timeSlot=${encodeURIComponent(timeSlot)}`,
//       {
//         method: 'GET',
//       }
//     ),

//   // Create ride from demand with selected student requests
//   createRideFromDemand: (rideData) =>
//     apiCall('/drivers/rides/create-from-demand', {
//       method: 'POST',
//       body: JSON.stringify(rideData),
//     }),

//   // Get rides owned by the current driver
//   getDriverRides: () =>
//     apiCall('/drivers/rides', {
//       method: 'GET',
//     }),

//   // Cancel ride
//   cancelRide: (rideId) =>
//     apiCall(`/drivers/rides/${rideId}/cancel`, {
//       method: 'PUT',
//     }),
// };

// export default apiCall;
// Ensure this file is named ending in .jsx !!
// D:\154\student ride sharying system\student ride sharing(frontend)\src\api\apiClient.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getToken = () => {
  return localStorage.getItem('token');
};

const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
};

// Authentication APIs
export const authAPI = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// Student APIs
export const studentAPI = {
  createRideRequest: (rideRequestData) =>
    apiCall('/students/requests', {
      method: 'POST',
      body: JSON.stringify(rideRequestData),
    }),

  searchRides: (source, destination, vehicleType, preferredTime) =>
    apiCall(
      `/students/rides/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&vehicleType=${vehicleType}&preferredTime=${encodeURIComponent(preferredTime)}`,
      {
        method: 'GET',
      }
    ),

  bookRide: (studentId, rideId) =>
    apiCall(`/students/${studentId}/bookings/${rideId}`, {
      method: 'POST',
    }),

  withdrawableBookings: (studentId) => 
    apiCall(`/students/${studentId}/bookings`, {
      method: 'GET'
    }),

  cancelBooking: (bookingId) =>
    apiCall(`/students/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    }),
};

// Driver APIs
export const driverAPI = {
  getDashboardDemand: () =>
    apiCall('/drivers/dashboard/demand', {
      method: 'GET',
    }),

  getClusterDetails: (source, destination, preferredVehicle, timeSlot) =>
    apiCall(
      `/drivers/demands/cluster-details?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&preferredVehicle=${encodeURIComponent(preferredVehicle)}&timeSlot=${encodeURIComponent(timeSlot)}`,
      {
        method: 'GET',
      }
    ),

  createRideFromDemand: (rideData) =>
    apiCall('/drivers/rides/create-from-demand', {
      method: 'POST',
      body: JSON.stringify(rideData),
    }),

  getDriverRides: () =>
    apiCall('/drivers/rides', {
      method: 'GET',
    }),

  cancelRide: (rideId) =>
    apiCall(`/drivers/rides/${rideId}/cancel`, {
      method: 'PUT',
    }),
};

export default apiCall;