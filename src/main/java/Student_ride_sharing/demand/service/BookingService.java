package Student_ride_sharing.demand.service;

import Student_ride_sharing.demand.dto.BookingResponseDto;
import Student_ride_sharing.demand.entity.Ride;

public interface BookingService {
    // 1. Used for single student manual booking actions
    BookingResponseDto createBooking(Long studentId, Long rideId);

    // 2. Overloaded variation used by RideServiceImpl loop to bypass double-increment bugs
    void createAutomatedBookingForCluster(Long studentId, Ride ride);

    void cancelBooking(Long bookingId);
}