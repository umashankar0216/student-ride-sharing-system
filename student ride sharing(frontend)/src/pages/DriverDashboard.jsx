
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { driverAPI } from '../api/apiClient';
import { Button, Input, Select, Alert, Loader, Card, Badge } from '../components/UI';
import '../styles/driver.css';

export const DriverDashboard = () => {
    const { user } = useAuth();
    const [demandGroups, setDemandGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingDemandGroup, setViewingDemandGroup] = useState(null); 
    const [activeTab, setActiveTab] = useState('demand');

    useEffect(() => {
        fetchDemandGroups();
        const interval = setInterval(fetchDemandGroups, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDemandGroups = async () => {
        try {
            setError('');
            const data = await driverAPI.getDashboardDemand();
            setDemandGroups(data);
        } catch (err) {
            setError(err.message || 'Failed to load demand details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="driver-dashboard">
            <div className="dashboard-header">
                <h1>Driver Dashboard</h1>
                <p>Welcome, {user?.email}</p>
                <Button onClick={fetchDemandGroups} variant="secondary">
                    Refresh Demand
                </Button>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('demand');
                        setViewingDemandGroup(null);
                    }}
                >
                    Demand Groups
                </button>
                <button
                    className={`tab-btn ${activeTab === 'rides' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('rides');
                        setViewingDemandGroup(null);
                    }}
                >
                    My Rides
                </button>
            </div>

            {error && <Alert type="error" message={error} />}

            {loading ? (
                <Loader message="Loading dashboard metrics..." />
            ) : activeTab === 'demand' ? (
                viewingDemandGroup ? (
                    <DemandGroupView
                        demand={viewingDemandGroup}
                        onBack={() => setViewingDemandGroup(null)}
                        onRideCreated={() => {
                            setViewingDemandGroup(null);
                            fetchDemandGroups();
                        }}
                    />
                ) : (
                    <div className="demand-section">
                        <h2>Available Ride Opportunities</h2>
                        {demandGroups.length > 0 ? (
                            <div className="demand-grid">
                                {demandGroups.map((demand, idx) => (
                                    <DemandCard
                                        key={idx}
                                        demand={demand}
                                        onSelect={() => setViewingDemandGroup(demand)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No pending ride requests. Check back soon!</p>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <DriverRides />
            )}
        </div>
    );
};

const DemandCard = ({ demand, onSelect }) => {
    const timeSlot = demand.timeSlot || 'TBD';
    const vehicleType = demand.preferredVehicle || 'ANY';
    const studentCount = demand.studentCount || 0;

    return (
        <Card className="demand-card">
            <div className="demand-route">
                <div className="route-info">
                    <p className="source">{demand.source}</p>
                    <div className="arrow">↓</div>
                    <p className="destination">{demand.destination}</p>
                </div>
                <Badge variant="primary">{vehicleType}</Badge>
            </div>

            <div className="demand-details">
                <div className="detail">
                    <span className="icon">⏰</span>
                    <span className="info">{timeSlot}</span>
                </div>
                <div className="detail">
                    <span className="icon">👥</span>
                    <span className="info">{studentCount} students interested</span>
                </div>
            </div>

            <div className="demand-footer">
                <p className="note">
                    {studentCount >= 3
                        ? '✓ Minimum students reached!'
                        : `${3 - studentCount} more needed for minimum`}
                </p>
                <Button onClick={onSelect} disabled={studentCount < 1}>
                    Visit Group
                </Button>
            </div>
        </Card>
    );
};

const DemandGroupView = ({ demand, onBack, onRideCreated }) => {
    const [formData, setFormData] = useState({
        driverId: 1, 
        source: demand.source,
        destination: demand.destination,
        vehicleType: demand.preferredVehicle === 'ANY' ? 'CAR' : demand.preferredVehicle,
        preferredTime: demand.timeSlot,
        totalSeats: 4,
        price: '',
        existingRideId: '' 
    });

    const [clusterRequests, setClusterRequests] = useState([]);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [activeDriverRides, setActiveDriverRides] = useState([]); 
    const [clusterLoading, setClusterLoading] = useState(true);
    const [clusterError, setClusterError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isExistingRideSelected = formData.existingRideId !== '';

    useEffect(() => {
        if (!demand) return;
        setClusterLoading(true);
        
        Promise.all([
            driverAPI.getClusterDetails(demand.source, demand.destination, demand.preferredVehicle, demand.timeSlot),
            driverAPI.getDriverRides()
        ])
            .then(([clusterData, ridesData]) => {
                setClusterRequests(clusterData);
                setSelectedRequests(clusterData.map(req => req.studentUsername));
                
                const matchingRides = ridesData.filter(
                    ride => ride.source === demand.source && ride.destination === demand.destination
                );
                setActiveDriverRides(matchingRides);
            })
            .catch(err => setClusterError(err.message || 'Failed to sync cluster metrics'))
            .finally(() => setClusterLoading(false));
    }, [demand]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'existingRideId' && value !== '') {
            const chosenRide = activeDriverRides.find(r => r.id.toString() === value);
            if (chosenRide) {
                setFormData(prev => ({
                    ...prev,
                    existingRideId: value,
                    vehicleType: chosenRide.vehicleType,
                    totalSeats: chosenRide.totalSeats,
                    price: chosenRide.price.toString()
                }));
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'totalSeats' ? parseInt(value) : value,
        }));
    };

    const toggleRequestSelection = (username) => {
        setSelectedRequests((prev) =>
            prev.includes(username)
                ? prev.filter((item) => item !== username)
                : [...prev, username]
        );
    };

    const selectedCount = selectedRequests.length;
    const totalSelectedAmount = clusterRequests
        .filter((req) => selectedRequests.includes(req.studentUsername))
        .reduce((sum, req) => sum + (parseFloat(req.price) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedRequests.length === 0) return setError('Please select at least one student request');
        if (!formData.price || formData.price <= 0) return setError('Please enter a valid fare price');
        if (formData.totalSeats < selectedRequests.length) return setError('Total seats config cannot be less than selected students count');

        setLoading(true);
        try {
            await driverAPI.createRideFromDemand({
                existingRideId: isExistingRideSelected ? parseInt(formData.existingRideId) : null,
                source: formData.source,
                destination: formData.destination,
                vehicleType: formData.vehicleType,
                preferredTime: formData.preferredTime,
                totalSeats: formData.totalSeats,
                price: parseFloat(formData.price),
                selectedUsernames: selectedRequests,
            });

            alert(isExistingRideSelected ? 'Students added to active ride successfully!' : 'Ride created from demand pool successfully!');
            onRideCreated();
        } catch (err) {
            setError(err.message || 'Failed to process routing generation request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="cluster-details-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <Button variant="secondary" onClick={onBack}>← Back to Groups</Button>
                <h2>Select Students & Finalize Allocation</h2>
            </div>

            {clusterLoading ? (
                <Loader message="Parsing group requests..." />
            ) : clusterError ? (
                <Alert type="error" message={clusterError} />
            ) : (
                <div className="cluster-details-section">
                    <div className="cluster-table" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                        <div className="cluster-row cluster-header" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 2fr 1fr', fontWeight: 'bold', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
                            <div>Add</div>
                            <div>Student</div>
                            <div>Vehicle Options</div>
                            <div>Requested Fare</div>
                        </div>
                        {clusterRequests.map((request) => (
                            <div key={request.id} className="cluster-row" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 2fr 1fr', padding: '0.75rem 0', alignItems: 'center', borderBottom: '1px solid #f9f9f9' }}>
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={selectedRequests.includes(request.studentUsername)}
                                        onChange={() => toggleRequestSelection(request.studentUsername)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                </div>
                                <div>{request.studentName || request.studentUsername}</div>
                                <div><Badge>{request.preferredVehicle}</Badge></div>
                                <div style={{ fontWeight: 'bold', color: '#2ecc71' }}>₹{request.price}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', padding: '1rem', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #eee' }}>
                        <span>{selectedCount} students selected</span>
                        <span>Total Group Value: ₹{totalSelectedAmount.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#2c3e50' }}>Allocation Type Target Link</label>
                    <select 
                        name="existingRideId" 
                        value={formData.existingRideId} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', background: '#fff' }}
                    >
                        <option value="">➕ Create a Brand New Active Ride Instance</option>
                        {activeDriverRides.map(ride => (
                            <option key={ride.id} value={ride.id}>
                                🚗 Assign to Existing Ride ID #{ride.id} (Seats filled: {ride.occupiedSeats}/{ride.totalSeats} - Operation type: {ride.vehicleType})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input label="Pickup Location" name="source" value={formData.source} disabled />
                    <Input label="Dropoff Destination" name="destination" value={formData.destination} disabled />
                    
                    <Select
                        label="Vehicle Setup *"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        disabled={isExistingRideSelected}
                        options={[
                            { value: 'CAR', label: 'Car' },
                            { value: 'AUTO', label: 'Auto' },
                            { value: 'BIKE', label: 'Bike' },
                        ]}
                    />
                    <Input 
                        label="Total Max Seats *" 
                        type="number" 
                        name="totalSeats" 
                        value={formData.totalSeats} 
                        onChange={handleChange} 
                        min={selectedCount} 
                        disabled={isExistingRideSelected}
                    />
                    <Input label="Target Time Window" name="preferredTime" value={formData.preferredTime} disabled />
                    <Input 
                        label="Fare Price per Seat (₹) *" 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                        required 
                        disabled={isExistingRideSelected}
                    />
                </div>
                
                <Button type="submit" loading={loading} style={{ marginTop: '1.5rem', width: '100%' }} disabled={selectedCount === 0}>
                    {isExistingRideSelected 
                        ? `Add Selected Students to Active Trip Row #${formData.existingRideId}`
                        : `Generate Fresh New Ride with ${selectedCount} Checked Students`
                    }
                </Button>
            </form>
        </Card>
    );
};

export const DriverRides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDriverRides = async () => {
        try {
            setError('');
            const data = await driverAPI.getDriverRides();
            setRides(data);
        } catch (err) {
            setError(err.message || 'Failed to load your rides profile list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchDriverRides(); 
    }, []);

    return (
        <div className="driver-rides">
            <div className="driver-rides-header">
                <h2>My Active Operating Rides</h2>
                <Button onClick={fetchDriverRides} variant="secondary">
                    Refresh List
                </Button>
            </div>
            {error && <Alert type="error" message={error} />}
            {loading ? (
                <Loader message="Retrieving active runs..." />
            ) : rides.length > 0 ? (
                <div className="rides-list">
                    {rides.map(ride => (
                        <RideManagementCard 
                            key={ride.id} 
                            ride={ride} 
                            onRideCancelled={fetchDriverRides} 
                        />
                    ))}
                </div>
            ) : (
                <p className="empty-message">No active rides registered. Fill one out using demand groupings above!</p>
            )}
        </div>
    );
};

const RideManagementCard = ({ ride, onRideCancelled }) => {
    const [canceling, setCanceling] = useState(false);

    const handleCancelRide = async () => {
        if (window.confirm('Are you sure you want to delete this ride? All active student bookings linked will be reverted.')) {
            try {
                setCanceling(true);
                await driverAPI.cancelRide(ride.id);
                alert('Ride tracking cleared safely.');
                onRideCancelled?.();
            } catch (err) {
                alert('Failed to cancel running operation row: ' + err.message);
            } finally {
                setCanceling(false);
            }
        }
    };

    const departureTime = new Date(ride.departureTime).toLocaleString();

    return (
        <Card className="ride-management-card">
            <div className="ride-header">
                <h3>{ride.source} → {ride.destination}</h3>
                <Badge>{ride.vehicleType}</Badge>
            </div>

            <div className="ride-info">
                <p><strong>Departure:</strong> {departureTime}</p>
                <p><strong>Capacity Allocation:</strong> {ride.occupiedSeats} / {ride.totalSeats} seats filled</p>
                <p><strong>Seat Price Tag:</strong> ₹{ride.price}</p>
            </div>

            <div className="ride-actions">
                <Button
                    onClick={handleCancelRide}
                    loading={canceling}
                    variant="danger"
                    className="full-width"
                >
                    Delete Ride Route
                </Button>
            </div>
        </Card>
    );
};