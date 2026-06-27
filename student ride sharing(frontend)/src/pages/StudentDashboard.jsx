
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../api/apiClient';
import { Input, Select, Button, Alert, Loader, Card,LocationInput,RouteMap } from '../components/UI';
// 1. Import your newly built LocationIQ Autocomplete Search Component
// Change this line (Line 403):

import '../styles/student.css';

export const StudentDashboard = () => {
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState('submit-request'); 

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Welcome, {user?.email}</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'submit-request' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit-request')}
        >
          Submit Ride Request
        </button>
        <button
          className={`tab-btn ${activeTab === 'search-rides' ? 'active' : ''}`}
          onClick={() => setActiveTab('search-rides')}
        >
          Search Rides
        </button>
        <button
          className={`tab-btn ${activeTab === 'my-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-bookings')}
        >
          My Bookings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'submit-request' && <SubmitRideRequest />}
        {activeTab === 'search-rides' && <SearchRides />}
        {activeTab === 'my-bookings' && <MyBookings />}
      </div>
    </div>
  );
};

const SubmitRideRequest = () => {
  const [formData, setFormData] = useState({
    userId: '',
    source: '',
    destination: '',
    preferredTime: '',
    preferredVehicle: 'ANY',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.source || !formData.destination || !formData.preferredTime || !formData.price) {
      setError('Please fill all required fields');
      return;
    }

    if (isNaN(formData.price) || formData.price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await studentAPI.createRideRequest({
        userId: 1, // Would be user.id from backend response
        source: formData.source,
        destination: formData.destination,
        preferredTime: new Date(formData.preferredTime).toISOString(),
        preferredVehicle: formData.preferredVehicle,
        price: parseFloat(formData.price),
      });

      setMessage('Ride request submitted successfully! Drivers will see your demand.');
      setFormData({
        userId: '',
        source: '',
        destination: '',
        preferredTime: '',
        preferredVehicle: 'ANY',
        price: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <Card className="form-card">
        <h2>Submit a Ride Request</h2>
        <p className="form-description">
          Tell us where you want to go and when. Drivers will see your demand and may create a ride for you!
        </p>

        {error && <Alert type="error" message={error} />}
        {message && <Alert type="success" message={message} />}

        <form onSubmit={handleSubmit}>
          
          {/* 2. Swapped text input out for the LocationIQ search menu */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Pickup Location *</label>
            <LocationInput
              placeholder="Search for college plaza, hostel, etc..."
              onLocationSelect={(addressString) => 
                setFormData((prev) => ({ ...prev, source: addressString }))
              }
            />
          </div>

          {/* 3. Swapped destination text field out for LocationIQ */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Destination *</label>
            <LocationInput
              placeholder="Search for drop-off destination..."
              onLocationSelect={(addressString) => 
                setFormData((prev) => ({ ...prev, destination: addressString }))
              }
            />
          </div>

          <Input
            label="Preferred Date & Time *"
            type="datetime-local"
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            required
          />

          <Select
            label="Preferred Vehicle Type"
            name="preferredVehicle"
            value={formData.preferredVehicle}
            onChange={handleChange}
            options={[
              { value: 'ANY', label: 'Any Vehicle' },
              { value: 'CAR', label: 'Car' },
              { value: 'AUTO', label: 'Auto (3-wheeler)' },
              { value: 'BIKE', label: 'Bike' },
            ]}
          />

          <Input
            label="Estimated Fare (Price) *"
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 200"
            required
          />

          <Button type="submit" loading={loading} className="full-width">
            Submit Request
          </Button>
        </form>
      </Card>
    </div>
  );
};

const SearchRides = () => {
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    vehicleType: 'ANY',
    preferredTime: '',
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false); // This sets up 'setLoading'
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setRides([]);

    if (!searchParams.source || !searchParams.destination || !searchParams.preferredTime) {
      setError('Please fill all search fields');
      return;
    }

    setLoading(true); // 🟢 CHANGED FROM loading(true) TO setLoading(true)
    setSearched(true);
    try {
      const results = await studentAPI.searchRides(
        searchParams.source,
        searchParams.destination,
        searchParams.vehicleType,
        searchParams.preferredTime 
      );
      setRides(results);

      if (results.length === 0) {
        setError('No rides found for your criteria. Try submitting a request!');
      }
    } catch (err) {
      setError(err.message || 'Failed to search rides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-section">
      <Card className="search-card">
        <h2>Find Available Rides</h2>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSearch} className="search-form">
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>From *</label>
            <LocationInput
              placeholder="Pickup location"
              onLocationSelect={(addressString) => 
                setSearchParams((prev) => ({ ...prev, source: addressString }))
              }
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>To *</label>
            <LocationInput
              placeholder="Destination"
              onLocationSelect={(addressString) => 
                setSearchParams((prev) => ({ ...prev, destination: addressString }))
              }
            />
          </div>

          <Input
            label="Date & Time *"
            type="datetime-local"
            name="preferredTime"
            value={searchParams.preferredTime}
            onChange={handleChange}
            required
          />

          <Select
            label="Vehicle Type"
            name="vehicleType"
            value={searchParams.vehicleType}
            onChange={handleChange}
            options={[
              { value: 'ANY', label: 'Any Vehicle' },
              { value: 'CAR', label: 'Car' },
              { value: 'AUTO', label: 'Auto (3-wheeler)' },
              { value: 'BIKE', label: 'Bike' },
            ]}
          />

          <Button type="submit" loading={loading} className="full-width">
            Search Rides
          </Button>
        </form>
      </Card>

      {loading && <Loader message="Searching for available rides..." />}

      {searched && rides.length > 0 && (
        <div className="rides-list">
          <h3>Available Rides ({rides.length})</h3>
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}

      {searched && rides.length === 0 && !loading && (
        <div className="empty-state">
          <p>No rides available. Submit a request and wait for drivers!</p>
        </div>
      )}
    </div>
  );
};

const RideCard = ({ ride }) => {
  const [booking, setBooking] = useState(false);
  const { user } = useAuth();

  const handleBookRide = async () => {
    try {
      setBooking(true);
      await studentAPI.bookRide(1, ride.id); // Would use user.id from backend
      alert('Booking confirmed! Check your bookings.');
      setBooking(false);
    } catch (err) {
      alert('Failed to book ride: ' + err.message);
      setBooking(false);
    }
  };

  const departureTime = new Date(ride.departureTime).toLocaleString();

  return (
    <Card className="ride-card">
      <div className="ride-header">
        <div className="route">
          <p className="source">{ride.source}</p>
          <div className="arrow">→</div>
          <p className="destination">{ride.destination}</p>
        </div>
        <span className={`vehicle-badge ${ride.vehicleType.toLowerCase()}`}>
          {ride.vehicleType}
        </span>
      </div>

      <div className="ride-details">
        <div className="detail">
          <span className="label">Departure:</span>
          <span className="value">{departureTime}</span>
        </div>
        <div className="detail">
          <span className="label">Available Seats:</span>
          <span className="value">{ride.availableSeats} / {ride.totalSeats}</span>
        </div>
        {ride.price && (
          <div className="detail">
            <span className="label">Fare:</span>
            <span className="value price-highlight">₹{ride.price}</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleBookRide}
        loading={booking}
        disabled={ride.availableSeats === 0}
        className="full-width"
      >
        {ride.availableSeats > 0 ? 'Book Now' : 'No Seats Available'}
      </Button>
    </Card>
  );
};


const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 🟢 NEW STATE: Tracks which ride the student is currently watching
  const [activeTrackingRideId, setActiveTrackingRideId] = useState(null);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentAPI.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await studentAPI.cancelBooking(bookingId);
      alert('Booking cancelled successfully!');
      
      // Clear tracking if they cancel the ride they are watching
      setActiveTrackingRideId(null); 
      fetchMyBookings(); 
    } catch (err) {
      alert('Failed to cancel booking: ' + err.message);
    }
  };

  const toggleTracking = (rideId) => {
    if (activeTrackingRideId === rideId) {
      setActiveTrackingRideId(null); // Close the map
    } else {
      setActiveTrackingRideId(rideId); // Open the map and connect to WebSocket
    }
  };

  return (
    <div className="bookings-section">
      <Card>
        <h2>My Bookings</h2>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <Loader message="Loading your bookings..." />
        ) : bookings.length > 0 ? (
          <div className="bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {bookings.map((booking) => {
              const isTracking = activeTrackingRideId === booking.ride?.id;

              return (
                <div key={booking.id} className="booking-item-card" style={{ border: isTracking ? '2px solid #3498db' : '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#f9f9f9', transition: 'all 0.3s ease' }}>
                  
                  {/* Top Info Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.9rem', color: '#555' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#000', display: 'block', marginBottom: '5px' }}>
                        {booking.ride?.source} → {booking.ride?.destination}
                      </strong>
                      <p>🗓️ <strong>Departure:</strong> {new Date(booking.ride?.departureTime).toLocaleString()}</p>
                      <p>🚗 <strong>Vehicle Type:</strong> {booking.ride?.vehicleType}</p>
                      <p>💰 <strong>Fare:</strong> ₹{booking.ride?.price}</p>
                      <p>👤 <strong>Driver:</strong> {booking.user?.name || booking.user?.username || 'Assigned Driver'}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <span className={`status-badge ${booking.status.toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', background: booking.status === 'CONFIRMED' ? '#e2fbe8' : '#ffebee', color: booking.status === 'CONFIRMED' ? '#2e7d32' : '#c62828' }}>
                        {booking.status}
                      </span>
                      
                      {/* 🟢 NEW TRACKING BUTTON */}
                      {booking.status === 'CONFIRMED' && (
                        <Button 
                          onClick={() => toggleTracking(booking.ride?.id)}
                          style={{ background: isTracking ? '#e74c3c' : '#3498db', padding: '6px 12px', fontSize: '0.9rem' }}
                        >
                          {isTracking ? '🛑 Close Map' : '🗺️ Track Live Ride'}
                        </Button>
                      )}

                      <Button 
                        onClick={() => handleCancelBooking(booking.id)} 
                        style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        Cancel Ride
                      </Button>
                    </div>
                  </div>

                {/* Inside StudentDashboard.jsx -> MyBookings */}
{isTracking && (
  <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
    <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>📡 Live Driver Telemetry</h4>
    
    <RouteMap 
      sourceText={booking.ride.source} 
      destinationText={booking.ride.destination} 
      rideId={booking.ride.id}
      
      // 🟢 THIS IS THE MAGIC WORD! It tells the map to act as a STOMP Receiver.
      role="STUDENT" 
    />
    
  </div>
)}

                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-message" style={{ textAlign: 'center', color: '#777', padding: '20px 0' }}>
            No bookings yet. Go to the "Search Rides" tab to find and book a trip!
          </p>
        )}
      </Card>
    </div>
  );
};