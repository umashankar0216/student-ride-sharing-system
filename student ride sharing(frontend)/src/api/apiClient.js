

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
    
    getMyBookings: () =>
    apiCall('/students/bookings', {
      method: 'GET',
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

    searchStudentDemands: (source, destination, preferredVehicle, timeSlot) =>
        apiCall(
            `/drivers/search-requests?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&preferredVehicle=${encodeURIComponent(preferredVehicle)}&date=${encodeURIComponent(timeSlot)}`,
            {
                method: 'GET',
            }
        ),
  
};

export default apiCall;