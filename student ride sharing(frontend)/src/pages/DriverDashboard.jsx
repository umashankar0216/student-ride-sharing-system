
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { driverAPI } from '../api/apiClient';
// import { Button, Input, Select, Alert, Loader, Card, Badge, RouteMap } from '../components/UI';
// import '../styles/driver.css';

// export const DriverDashboard = () => {
//     const { user } = useAuth();
//     const [demandGroups, setDemandGroups] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [viewingDemandGroup, setViewingDemandGroup] = useState(null); 
//     const [activeTab, setActiveTab] = useState('demand');

//     // 🟢 TRACKING STATE: Tracks which ride ID has live tracking active globally
//     const [activeTrackingRideId, setActiveTrackingRideId] = useState(null);

//     useEffect(() => {
//         fetchDemandGroups();
//         const interval = setInterval(fetchDemandGroups, 30000);
//         return () => clearInterval(interval);
//     }, []);

//     const fetchDemandGroups = async () => {
//         try {
//             setError('');
//             const data = await driverAPI.getDashboardDemand();
//             setDemandGroups(data);
//         } catch (err) {
//             setError(err.message || 'Failed to load demand details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="driver-dashboard">
//             <div className="dashboard-header">
//                 <h1>Driver Dashboard</h1>
//                 <p>Welcome, {user?.email}</p>
//                 <Button onClick={fetchDemandGroups} variant="secondary">
//                     Refresh Demand
//                 </Button>
//             </div>

//             <div className="dashboard-tabs">
//                 <button
//                     className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`}
//                     onClick={() => {
//                         setActiveTab('demand');
//                         setViewingDemandGroup(null);
//                     }}
//                 >
//                     Demand Groups
//                 </button>
//                 <button
//                     className={`tab-btn ${activeTab === 'rides' ? 'active' : ''}`}
//                     onClick={() => {
//                         setActiveTab('rides');
//                         setViewingDemandGroup(null);
//                     }}
//                 >
//                     My Rides
//                 </button>
//             </div>

//             {error && <Alert type="error" message={error} />}

//             {loading ? (
//                 <Loader message="Loading dashboard metrics..." />
//             ) : activeTab === 'demand' ? (
//                 viewingDemandGroup ? (
//                     <DemandGroupView
//                         demand={viewingDemandGroup}
//                         activeTrackingRideId={activeTrackingRideId}
//                         onBack={() => setViewingDemandGroup(null)}
//                         onRideCreated={() => {
//                             setViewingDemandGroup(null);
//                             fetchDemandGroups();
//                         }}
//                     />
//                 ) : (
//                     <div className="demand-section">
//                         <h2>Available Ride Opportunities</h2>
//                         {demandGroups.length > 0 ? (
//                             <div className="demand-grid">
//                                 {demandGroups.map((demand, idx) => (
//                                     <DemandCard
//                                         key={idx}
//                                         demand={demand}
//                                         onSelect={() => setViewingDemandGroup(demand)}
//                                     />
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="empty-state">
//                                 <p>No pending ride requests. Check back soon!</p>
//                             </div>
//                         )}
//                     </div>
//                 )
//             ) : (
//                 /* 🟢 Pass active state down to My Rides tab */
//                 <DriverRides 
//                     activeTrackingRideId={activeTrackingRideId}
//                     setActiveTrackingRideId={setActiveTrackingRideId}
//                 />
//             )}
//         </div>
//     );
// };

// const DemandCard = ({ demand, onSelect }) => {
//     const timeSlot = demand.timeSlot || 'TBD';
//     const vehicleType = demand.preferredVehicle || 'ANY';
//     const studentCount = demand.studentCount || 0;

//     return (
//         <Card className="demand-card">
//             <div className="demand-route">
//                 <div className="route-info">
//                     <p className="source">{demand.source}</p>
//                     <div className="arrow">↓</div>
//                     <p className="destination">{demand.destination}</p>
//                 </div>
//                 <Badge variant="primary">{vehicleType}</Badge>
//             </div>

//             <div className="demand-details">
//                 <div className="detail">
//                     <span className="icon">⏰</span>
//                     <span className="info">{timeSlot}</span>
//                 </div>
//                 <div className="detail">
//                     <span className="icon">👥</span>
//                     <span className="info">{studentCount} students interested</span>
//                 </div>
//             </div>

//             <div className="demand-footer">
//                 <p className="note">
//                     {studentCount >= 3
//                         ? '✓ Minimum students reached!'
//                         : `${3 - studentCount} more needed for minimum`}
//                 </p>
//                 <Button onClick={onSelect} disabled={studentCount < 1}>
//                     Visit Group
//                 </Button>
//             </div>
//         </Card>
//     );
// };

// const DemandGroupView = ({ demand, onBack, onRideCreated, activeTrackingRideId }) => {
//     const [formData, setFormData] = useState({
//         driverId: 1, 
//         source: demand.source,
//         destination: demand.destination,
//         vehicleType: demand.preferredVehicle === 'ANY' ? 'CAR' : demand.preferredVehicle,
//         preferredTime: demand.timeSlot,
//         totalSeats: 4,
//         price: '',
//         existingRideId: '' 
//     });

//     const [clusterRequests, setClusterRequests] = useState([]);
//     const [selectedRequests, setSelectedRequests] = useState([]);
//     const [activeDriverRides, setActiveDriverRides] = useState([]); 
//     const [clusterLoading, setClusterLoading] = useState(true);
//     const [clusterError, setClusterError] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const [routeMetrics, setRouteMetrics] = useState({ distance: null, duration: null, loading: false });

//     const isExistingRideSelected = formData.existingRideId !== '';

//     useEffect(() => {
//         if (!demand) return;
//         setClusterLoading(true);
        
//         Promise.all([
//             driverAPI.getClusterDetails(demand.source, demand.destination, demand.preferredVehicle, demand.timeSlot),
//             driverAPI.getDriverRides()
//         ])
//             .then(([clusterData, ridesData]) => {
//                 setClusterRequests(clusterData);
//                 setSelectedRequests(clusterData.map(req => req.studentUsername));
                
//                 const matchingRides = ridesData.filter(
//                     ride => ride.source === demand.source && ride.destination === demand.destination
//                 );
//                 setActiveDriverRides(matchingRides);
//             })
//             .catch(err => setClusterError(err.message || 'Failed to sync cluster metrics'))
//             .finally(() => setClusterLoading(false));
//     }, [demand]);

//     useEffect(() => {
//         if (!demand?.source || !demand?.destination) return;

//         let isMounted = true; 

//         const calculateLiveRouteInfo = async () => {
//             setRouteMetrics(prev => ({ ...prev, loading: true }));
//             try {
//                 const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
//                 const srcRes = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(demand.source)}&format=json&limit=1`);
//                 if (!srcRes.ok) throw new Error(`Source geocode failed: ${srcRes.status}`);
//                 const srcData = await srcRes.json();
                
//                 await delay(600); 
//                 if (!isMounted) return;

//                 const destRes = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(demand.destination)}&format=json&limit=1`);
//                 if (!destRes.ok) throw new Error(`Destination geocode failed: ${destRes.status}`);
//                 const destData = await destRes.json();

//                 await delay(600);
//                 if (!isMounted) return;

//                 const srcLat = srcData[0].lat;
//                 const srcLon = srcData[0].lon;
//                 const destLat = destData[0].lat;
//                 const destLon = destData[0].lon;

//                 const routeRes = await fetch(`https://us1.locationiq.com/v1/directions/driving/${srcLon},${srcLat};${destLon},${destLat}?key=${apiKey}&overview=false`);
                
//                 if (routeRes.ok) {
//                     const routeData = await routeRes.json();
//                     const primaryRoute = routeData.routes[0];

//                     if (isMounted) {
//                         setRouteMetrics({
//                             distance: (primaryRoute.distance / 1000).toFixed(1) + " km",
//                             duration: Math.round(primaryRoute.duration / 60) + " mins",
//                             loading: false
//                         });
//                     }
//                     return;
//                 }
//             } catch (err) {
//                 console.error("LocationIQ estimation throttling error:", err);
//             }
//             if (isMounted) {
//                 setRouteMetrics({ distance: "N/A", duration: "N/A", loading: false });
//             }
//         };

//         const debounceTimer = setTimeout(() => {
//             calculateLiveRouteInfo();
//         }, 500);

//         return () => {
//             isMounted = false;
//             clearTimeout(debounceTimer);
//         };
//     }, [demand.source, demand.destination]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         if (name === 'existingRideId' && value !== '') {
//             const chosenRide = activeDriverRides.find(r => r.id.toString() === value);
//             if (chosenRide) {
//                 setFormData(prev => ({
//                     ...prev,
//                     existingRideId: value,
//                     vehicleType: chosenRide.vehicleType,
//                     totalSeats: chosenRide.totalSeats,
//                     price: chosenRide.price.toString()
//                 }));
//                 return;
//             }
//         }
//         setFormData((prev) => ({ ...prev, [name]: name === 'totalSeats' ? parseInt(value) : value }));
//     };

//     const toggleRequestSelection = (username) => {
//         setSelectedRequests((prev) => prev.includes(username) ? prev.filter((item) => item !== username) : [...prev, username]);
//     };

//     const selectedCount = selectedRequests.length;
//     const totalSelectedAmount = clusterRequests.filter((req) => selectedRequests.includes(req.studentUsername)).reduce((sum, req) => sum + (parseFloat(req.price) || 0), 0);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         if (selectedRequests.length === 0) return setError('Please select at least one student request');
//         if (!formData.price || formData.price <= 0) return setError('Please enter a valid fare price');
//         if (formData.totalSeats < selectedRequests.length) return setError('Total seats cannot be less than selected students');

//         setLoading(true);
//         try {
//             await driverAPI.createRideFromDemand({
//                 existingRideId: isExistingRideSelected ? parseInt(formData.existingRideId) : null,
//                 source: formData.source,
//                 destination: formData.destination,
//                 vehicleType: formData.vehicleType,
//                 preferredTime: formData.preferredTime,
//                 totalSeats: formData.totalSeats,
//                 price: parseFloat(formData.price),
//                 selectedUsernames: selectedRequests,
//             });
//             alert(isExistingRideSelected ? 'Students added to active ride successfully!' : 'Ride created successfully!');
//             onRideCreated();
//         } catch (err) {
//             setError(err.message || 'Failed to process routing generation request');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Card className="cluster-details-page">
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
//                 <Button variant="secondary" onClick={onBack}>← Back to Groups</Button>
//                 <h2>Select Students & Finalize Allocation</h2>
//             </div>

//             <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
//                 {/* Inputs hidden for brevity */}
//                 <Button type="submit" loading={loading}>Submit Allocation</Button>
//             </form>
//         </Card>
//     );
// };

// export const DriverRides = ({ activeTrackingRideId, setActiveTrackingRideId }) => {
//     const [rides, setRides] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     const fetchDriverRides = async () => {
//         try {
//             setError('');
//             const data = await driverAPI.getDriverRides();
//             setRides(data);
//         } catch (err) {
//             setError(err.message || 'Failed to load rides profile list');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { 
//         fetchDriverRides(); 
//     }, []);

//     // 🟢 FIND THE CURRENTLY ACTIVE TRACKING RIDE OBJECT
//     const activeRideObj = rides.find(r => r.id === activeTrackingRideId);

//     return (
//         <div className="driver-rides">
//             {/* 🟢 MAP RENDERS HERE IN "MY RIDES" TAB ONLY WHEN START RIDE IS CLICKED */}
//             {activeRideObj && (
//                 <div style={{ marginBottom: '2rem', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
//                     <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>
//                         🛰️ Live Tracking: Ride #{activeRideObj.id} ({activeRideObj.source} → {activeRideObj.destination})
//                     </h3>
//                     <RouteMap 
//                         sourceText={activeRideObj.source} 
//                         destinationText={activeRideObj.destination} 
//                         rideId={activeRideObj.id}
//                         role="DRIVER"
//                     />
//                 </div>
//             )}

//             <div className="driver-rides-header">
//                 <h2>My Active Operating Rides</h2>
//                 <Button onClick={fetchDriverRides} variant="secondary">
//                     Refresh List
//                 </Button>
//             </div>
//             {error && <Alert type="error" message={error} />}
//             {loading ? (
//                 <Loader message="Retrieving active runs..." />
//             ) : rides.length > 0 ? (
//                 <div className="rides-list">
//                     {rides.map(ride => (
//                         <RideManagementCard 
//                             key={ride.id} 
//                             ride={ride} 
//                             onRideCancelled={fetchDriverRides} 
//                             activeTrackingRideId={activeTrackingRideId}
//                             setActiveTrackingRideId={setActiveTrackingRideId}
//                         />
//                     ))}
//                 </div>
//             ) : (
//                 <p className="empty-message">No active rides registered.</p>
//             )}
//         </div>
//     );
// };

// const RideManagementCard = ({ ride, onRideCancelled, activeTrackingRideId, setActiveTrackingRideId }) => {
//     const [canceling, setCanceling] = useState(false);
//     const isCurrentlyTracking = activeTrackingRideId === ride.id;

//     const handleCancelRide = async () => {
//         if (window.confirm('Are you sure you want to delete this ride?')) {
//             try {
//                 setCanceling(true);
//                 await driverAPI.cancelRide(ride.id);
//                 if (isCurrentlyTracking) setActiveTrackingRideId(null);
//                 alert('Ride cancelled safely.');
//                 onRideCancelled?.();
//             } catch (err) {
//                 alert('Failed to cancel ride: ' + err.message);
//             } finally {
//                 setCanceling(false);
//             }
//         }
//     };

//     const toggleTrackingTrigger = () => {
//         if (isCurrentlyTracking) {
//             setActiveTrackingRideId(null); 
//         } else {
//             setActiveTrackingRideId(ride.id); 
//             alert(`📡 Live GPS Tracking initialized for Ride ID #${ride.id}! Map route loaded.`);
//         }
//     };

//     const departureTime = new Date(ride.departureTime).toLocaleString();

//     return (
//         <Card className="ride-management-card" style={{ border: isCurrentlyTracking ? '2px solid #2ecc71' : '1px solid #ddd' }}>
//             <div className="ride-header">
//                 <h3>{ride.source} → {ride.destination}</h3>
//                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                     {isCurrentlyTracking && <Badge variant="success">🛰️ LIVE TRACKING ACTIVE</Badge>}
//                     <Badge>{ride.vehicleType}</Badge>
//                 </div>
//             </div>

//             <div className="ride-info">
//                 <p><strong>Departure:</strong> {departureTime}</p>
//                 <p><strong>Capacity Allocation:</strong> {ride.occupiedSeats} / {ride.totalSeats} seats filled</p>
//                 <p><strong>Seat Price Tag:</strong> ₹{ride.price}</p>
//             </div>

//             <div className="ride-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px', marginTop: '1.2rem', width: '100%' }}>
//                 <Button
//                     onClick={toggleTrackingTrigger}
//                     style={{ background: isCurrentlyTracking ? '#e74c3c' : '#2ecc71', color: '#fff', flex: '1 1 180px', padding: '10px 12px', whiteSpace: 'nowrap' }}
//                 >
//                     {isCurrentlyTracking ? '🛑 Stop Ride Tracking' : '🚗 Start Ride / Go Live'}
//                 </Button>
                
//                 <Button onClick={handleCancelRide} loading={canceling} variant="danger" style={{ flex: '1 1 150px', padding: '10px 12px' }}>
//                     Delete Ride Route
//                 </Button>
//             </div>
//         </Card>
//     );
// };
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { driverAPI } from '../api/apiClient';
import { Button, Input, Select, Alert, Loader, Card, Badge, RouteMap,LocationInput } from '../components/UI';
import '../styles/driver.css';

export const DriverDashboard = () => {
    const { user } = useAuth();
    const [demandGroups, setDemandGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingDemandGroup, setViewingDemandGroup] = useState(null); 
    const [activeTab, setActiveTab] = useState('demand');

    // 🟢 TRACKING STATE: Tracks which ride ID has live tracking active globally
    const [activeTrackingRideId, setActiveTrackingRideId] = useState(null);

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
                {/* 🟢 NEW SEARCH TAB */}
                <button
                    className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('search');
                        setViewingDemandGroup(null);
                    }}
                >
                    Search Student Requests
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
                        activeTrackingRideId={activeTrackingRideId}
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
            ) : activeTab === 'search' ? (
                /* 🟢 ROUTE TO NEW MANUAL DISPATCH COMPONENT */
                <SearchStudentRequests onRideCreated={() => setActiveTab('rides')} />
            ) : (
                <DriverRides 
                    activeTrackingRideId={activeTrackingRideId}
                    setActiveTrackingRideId={setActiveTrackingRideId}
                />
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

// 🟢 RATE LIMITER: Halts execution context threads to strictly respect LocationIQ 2-QPS rules
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const DemandGroupView = ({ demand, onBack, onRideCreated, activeTrackingRideId }) => {
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

    const [routeMetrics, setRouteMetrics] = useState({ distance: null, duration: null, loading: false });

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

    useEffect(() => {
        if (!demand?.source || !demand?.destination) return;

        let isMounted = true; 

        const calculateLiveRouteInfo = async () => {
            setRouteMetrics(prev => ({ ...prev, loading: true }));
            try {
                const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
                const srcRes = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(demand.source)}&format=json&limit=1`);
                if (!srcRes.ok) throw new Error(`Source geocode failed: ${srcRes.status}`);
                const srcData = await srcRes.json();
                
                await delay(600); 
                if (!isMounted) return;

                const destRes = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(demand.destination)}&format=json&limit=1`);
                if (!destRes.ok) throw new Error(`Destination geocode failed: ${destRes.status}`);
                const destData = await destRes.json();

                await delay(600);
                if (!isMounted) return;

                const srcLat = srcData[0].lat;
                const srcLon = srcData[0].lon;
                const destLat = destData[0].lat;
                const destLon = destData[0].lon;

                const routeRes = await fetch(`https://us1.locationiq.com/v1/directions/driving/${srcLon},${srcLat};${destLon},${destLat}?key=${apiKey}&overview=false`);
                
                if (routeRes.ok) {
                    const routeData = await routeRes.json();
                    const primaryRoute = routeData.routes[0];

                    if (isMounted) {
                        setRouteMetrics({
                            distance: (primaryRoute.distance / 1000).toFixed(1) + " km",
                            duration: Math.round(primaryRoute.duration / 60) + " mins",
                            loading: false
                        });
                    }
                    return;
                }
            } catch (err) {
                console.error("LocationIQ estimation throttling error:", err);
            }
            if (isMounted) {
                setRouteMetrics({ distance: "N/A", duration: "N/A", loading: false });
            }
        };

        const debounceTimer = setTimeout(() => {
            calculateLiveRouteInfo();
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(debounceTimer);
        };
    }, [demand.source, demand.destination]);

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
        setFormData((prev) => ({ ...prev, [name]: name === 'totalSeats' ? parseInt(value) : value }));
    };

    const toggleRequestSelection = (username) => {
        setSelectedRequests((prev) => prev.includes(username) ? prev.filter((item) => item !== username) : [...prev, username]);
    };

    const selectedCount = selectedRequests.length;
    const totalSelectedAmount = clusterRequests.filter((req) => selectedRequests.includes(req.studentUsername)).reduce((sum, req) => sum + (parseFloat(req.price) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (selectedRequests.length === 0) return setError('Please select at least one student request');
        if (!formData.price || formData.price <= 0) return setError('Please enter a valid fare price');
        if (formData.totalSeats < selectedRequests.length) return setError('Total seats cannot be less than selected students');

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
            alert(isExistingRideSelected ? 'Students added to active ride successfully!' : 'Ride created successfully!');
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

            <RouteMap 
                sourceText={demand.source} 
                destinationText={demand.destination} 
                rideId={activeTrackingRideId || formData.existingRideId || "preview"}
                role="DRIVER"
            />

            <div style={{ background: '#eef2f3', padding: '12px 20px', borderRadius: '6px', display: 'flex', gap: '30px', marginBottom: '1.5rem', borderLeft: '5px solid #3498db', fontSize: '14px' }}>
                <div>🗺️ <strong>Live Map Optimization Engine Metrics:</strong></div>
                {routeMetrics.loading ? (
                    <span style={{ color: '#888' }}>Calculating driving matrix maps...</span>
                ) : (
                    <>
                        <div>🛣️ <strong>Driving Distance:</strong> <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>{routeMetrics.distance || 'Fetching...'}</span></div>
                        <div>⏱️ <strong>Estimated Run Duration:</strong> <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>{routeMetrics.duration || 'Fetching...'}</span></div>
                    </>
                )}
            </div>

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

/* 🟢 NEW COMPONENT: SEARCH AND ASSIGN PENDING STUDENT DEMANDS */
export const SearchStudentRequests = ({ onRideCreated }) => {
    const [searchParams, setSearchParams] = useState({ 
        source: '', 
        destination: '', 
        preferredVehicle: 'CAR', 
        timeSlot: '' 
    });
    const [searchResults, setSearchResults] = useState([]);
    
    // Tracks selections using composite row indices to prevent checkbox anomalies
    const [selectedCompositeKeys, setSelectedCompositeKeys] = useState([]);
    const [activeDriverRides, setActiveDriverRides] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [submitLoading, setLoading] = useState(false);

    const [allocationForm, setAllocationForm] = useState({
        existingRideId: '',
        vehicleType: 'CAR',
        totalSeats: 4,
        price: ''
    });

    const isExistingRideSelected = allocationForm.existingRideId !== '';

    useEffect(() => {
        driverAPI.getDriverRides()
            .then(data => setActiveDriverRides(data || []))
            .catch(err => console.error("Failed to sync driver rides context", err));
    }, []);

    const executeSearchRequest = async (e) => {
        e.preventDefault();
        if (!searchParams.source || !searchParams.destination || !searchParams.timeSlot) {
            alert("Please completely fill out the input filters!");
            return;
        }
        setSearchLoading(true);
        setSelectedCompositeKeys([]); 
        
        // Enforce time slot string bucket formatting: YYYY-MM-DD HH:mm
        let formattedTimeSlot = searchParams.timeSlot.replace('T', ' ');
        if (formattedTimeSlot.includes(':')) {
            const [datePart, timePart] = formattedTimeSlot.split(' ');
            const [hours, minutes] = timePart.split(':');
            const roundedMinutes = parseInt(minutes) < 30 ? '00' : '30';
            formattedTimeSlot = `${datePart} ${hours}:${roundedMinutes}`;
        }

        try {
            const results = await driverAPI.searchStudentDemands(
                searchParams.source, 
                searchParams.destination, 
                searchParams.preferredVehicle, 
                formattedTimeSlot
            );
            setSearchResults(results);
        } catch (err) {
            alert("Search failed: " + err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    const toggleCheckboxSelection = (key) => {
        setSelectedCompositeKeys(prev => 
            prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
        );
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'existingRideId' && value !== '') {
            const chosen = activeDriverRides.find(r => r.id.toString() === value);
            if (chosen) {
                setAllocationForm({
                    existingRideId: value,
                    vehicleType: chosen.vehicleType,
                    totalSeats: chosen.totalSeats,
                    price: chosen.price.toString()
                });
                return;
            }
        }
        setAllocationForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (selectedCompositeKeys.length === 0) return alert("Select at least one checkbox student target!");
    if (!allocationForm.price || allocationForm.price <= 0) return alert("Provide a valid fare price per seat!");

    // 🟢 PAYLOAD ALIGNMENT: selectedCompositeKeys now tracks real usernames directly
    const targetUsernames = [...selectedCompositeKeys];

    // Align address parameters explicitly to eliminate typing spacing variances
    const exactSource = searchResults[0]?.source || searchParams.source;
    const exactDestination = searchResults[0]?.destination || searchParams.destination;

    let targetTime = searchParams.timeSlot.replace('T', ' ');
    if (targetTime.includes(':')) {
        const [datePart, timePart] = targetTime.split(' ');
        const [hours, minutes] = timePart.split(':');
        const roundedMinutes = parseInt(minutes) < 30 ? '00' : '30';
        targetTime = `${datePart} ${hours}:${roundedMinutes}`;
    }

    setLoading(true);
    try {
        await driverAPI.createRideFromDemand({
            selectedUsernames: targetUsernames, // 🟢 Clean array of real string usernames sent successfully!
            existingRideId: isExistingRideSelected ? parseInt(allocationForm.existingRideId) : null,
            source: exactSource,                 
            destination: exactDestination,           
            vehicleType: allocationForm.vehicleType,
            preferredTime: targetTime, 
            totalSeats: parseInt(allocationForm.totalSeats),
            price: parseFloat(allocationForm.price),
        });
        
        alert(isExistingRideSelected ? "Appended to existing ride successfully!" : "Fresh ride and allocations built successfully!");
        setSelectedCompositeKeys([]); 
        onRideCreated();
    } catch (err) {
        alert("Allocation execution failure: " + err.message);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="search-requests-tab" style={{ marginTop: '1.5rem' }}>
            <Card>
                <h3>🔍 Manual Cluster Scan</h3>
                <form onSubmit={executeSearchRequest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginTop: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Pickup Source *</label>
                        <LocationInput placeholder="Search pickup spot..." onLocationSelect={(addr) => setSearchParams(prev => ({ ...prev, source: addr }))} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '14px' }}>Dropoff Destination *</label>
                        <LocationInput placeholder="Search destination..." onLocationSelect={(addr) => setSearchParams(prev => ({ ...prev, destination: addr }))} />
                    </div>
                    <Select 
                        label="Vehicle Filter" 
                        value={searchParams.preferredVehicle} 
                        onChange={e => setSearchParams({...searchParams, preferredVehicle: e.target.value})}
                        options={[{value:'ANY', label:'Any'}, {value:'CAR', label:'Car'}, {value:'AUTO', label:'Auto'}, {value:'BIKE', label:'Bike'}]} 
                    />
                    <Input label="Preferred Date & Time *" type="datetime-local" value={searchParams.timeSlot} onChange={e => setSearchParams({...searchParams, timeSlot: e.target.value})} required />
                    <Button type="submit" loading={searchLoading}>Scan</Button>
                </form>
            </Card>

            {searchResults.length > 0 && (
                <form onSubmit={handleDispatchSubmit} style={{ marginTop: '2rem' }}>
                    <Card>
                        <h3>👥 Matching Student Requests ({searchResults.length})</h3>
                        <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', margin: '1.5rem 0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 2fr 1fr', fontWeight: 'bold', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
                                <div>Select</div>
                                <div>Student Identifier</div>
                                <div>Preferred Vehicle</div>
                                <div>Offered Price</div>
                            </div>
                           {searchResults.map((req, idx) => {
    // 🟢 ENFORCE USERNAME SELECTION KEY: Maps explicitly to the string username field
    const dynamicRowKey = req.studentUsername || (req.userId ? req.userId.toString() : `idx-${idx}`);
    
    return (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 2fr 1fr', padding: '0.75rem 0', alignItems: 'center', borderBottom: '1px solid #f9f9f9' }}>
            <div>
                <input 
                    type="checkbox" 
                    checked={selectedCompositeKeys.includes(dynamicRowKey)} 
                    onChange={() => toggleCheckboxSelection(dynamicRowKey)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
            </div>
            {/* 🟢 RENDER USERNAME VALUE: Displays the real student username string directly inside the identifier column */}
            <div style={{ fontWeight: '500' }}>
                {req.studentUsername} {req.studentName && <span style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: 'normal' }}>({req.studentName})</span>}
            </div>
            <div><Badge>{req.preferredVehicle}</Badge></div>
            <div style={{ fontWeight: 'bold', color: '#2ecc71' }}>₹{req.price}</div>
        </div>
    );
})}
                        </div>

                        <h3>📦 Allocation Action</h3>
                        <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Link Allocation Target</label>
                            <select name="existingRideId" value={allocationForm.existingRideId} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}>
                                <option value="">➕ Generate a Brand New Ride Route</option>
                                {activeDriverRides.map(ride => (
                                    <option key={ride.id} value={ride.id}>
                                        🚗 Append to Active Ride Row #{ride.id} ({ride.source.substring(0,20)}... → {ride.destination.substring(0,20)}...) [Seats Filled: {ride.occupiedSeats}/{ride.totalSeats}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <Select label="Vehicle Type" name="vehicleType" value={allocationForm.vehicleType} onChange={handleFormChange} disabled={isExistingRideSelected} options={[{value:'CAR', label:'Car'},{value:'AUTO', label:'Auto'},{value:'BIKE', label:'Bike'}]} />
                            <Input label="Max Vehicle Seats" type="number" name="totalSeats" value={allocationForm.totalSeats} onChange={handleFormChange} disabled={isExistingRideSelected} min={selectedCompositeKeys.length} />
                            <Input label="Fare Price per Seat (₹)" type="number" name="price" value={allocationForm.price} onChange={handleFormChange} required />
                        </div>

                        <Button type="submit" loading={submitLoading} style={{ marginTop: '1.5rem', width: '100%' }} disabled={selectedCompositeKeys.length === 0}>
                            {isExistingRideSelected ? `Commit Rows to Existing Ride ID #${allocationForm.existingRideId}` : 'Generate Fresh Active Ride Route'}
                        </Button>
                    </Card>
                </form>
            )}
        </div>
    );
};

export const DriverRides = ({ activeTrackingRideId, setActiveTrackingRideId }) => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDriverRides = async () => {
        try {
            setError('');
            const data = await driverAPI.getDriverRides();
            setRides(data);
        } catch (err) {
            setError(err.message || 'Failed to load rides profile list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchDriverRides(); 
    }, []);

    const activeRideObj = rides.find(r => r.id === activeTrackingRideId);

    return (
        <div className="driver-rides">
            {activeRideObj && (
                <div style={{ marginBottom: '2rem', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>
                        🛰️ Live Tracking: Ride #{activeRideObj.id} ({activeRideObj.source} → {activeRideObj.destination})
                    </h3>
                    <RouteMap 
                        sourceText={activeRideObj.source} 
                        destinationText={activeRideObj.destination} 
                        rideId={activeRideObj.id}
                        role="DRIVER"
                    />
                </div>
            )}

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
                            activeTrackingRideId={activeTrackingRideId}
                            setActiveTrackingRideId={setActiveTrackingRideId}
                        />
                    ))}
                </div>
            ) : (
                <p className="empty-message">No active rides registered.</p>
            )}
        </div>
    );
};

const RideManagementCard = ({ ride, onRideCancelled, activeTrackingRideId, setActiveTrackingRideId }) => {
    const [canceling, setCanceling] = useState(false);
    
    const isCurrentlyTracking = activeTrackingRideId === ride.id;

    const handleCancelRide = async () => {
        if (window.confirm('Are you sure you want to delete this ride?')) {
            try {
                setCanceling(true);
                await driverAPI.cancelRide(ride.id);
                if (isCurrentlyTracking) setActiveTrackingRideId(null);
                alert('Ride cancelled safely.');
                onRideCancelled?.();
            } catch (err) {
                alert('Failed to cancel ride: ' + err.message);
            } finally {
                setCanceling(false);
            }
        }
    };

    const toggleTrackingTrigger = () => {
        if (isCurrentlyTracking) {
            setActiveTrackingRideId(null); 
        } else {
            setActiveTrackingRideId(ride.id); 
            alert(`📡 Live GPS Tracking initialized for Ride ID #${ride.id}! Map route loaded.`);
        }
    };

    const departureTime = new Date(ride.departureTime).toLocaleString();

    return (
        <Card className="ride-management-card" style={{ border: isCurrentlyTracking ? '2px solid #2ecc71' : '1px solid #ddd' }}>
            <div className="ride-header">
                <h3>{ride.source} → {ride.destination}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isCurrentlyTracking && <Badge variant="success">🛰️ LIVE TRACKING ACTIVE</Badge>}
                    <Badge>{ride.vehicleType}</Badge>
                </div>
            </div>

            <div className="ride-info">
                <p><strong>Departure:</strong> {departureTime}</p>
                <p><strong>Capacity Allocation:</strong> {ride.occupiedSeats} / {ride.totalSeats} seats filled</p>
                <p><strong>Seat Price Tag:</strong> ₹{ride.price}</p>
            </div>

            <div className="ride-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px', marginTop: '1.2rem', width: '100%' }}>
                <Button
                    onClick={toggleTrackingTrigger}
                    style={{ background: isCurrentlyTracking ? '#e74c3c' : '#2ecc71', color: '#fff', flex: '1 1 180px', padding: '10px 12px', whiteSpace: 'nowrap' }}
                >
                    {isCurrentlyTracking ? '🛑 Stop Ride Tracking' : '🚗 Start Ride / Go Live'}
                </Button>
                
                <Button onClick={handleCancelRide} loading={canceling} variant="danger" style={{ flex: '1 1 150px', padding: '10px 12px' }}>
                    Delete Ride Route
                </Button>
            </div>
        </Card>
    );
};