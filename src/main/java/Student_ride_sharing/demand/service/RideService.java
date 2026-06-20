package Student_ride_sharing.demand.service;


import Student_ride_sharing.demand.dto.CreateRideFromDemandDto;
import Student_ride_sharing.demand.dto.RideResponseDto;
import Student_ride_sharing.demand.entity.VehicleType;

public interface RideService {
    RideResponseDto acceptDemandAndCreateRide(CreateRideFromDemandDto dto);
    void cancelRideByDriver(Long rideId);
}
