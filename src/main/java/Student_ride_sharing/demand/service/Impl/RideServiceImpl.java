package Student_ride_sharing.demand.service.Impl;

import Student_ride_sharing.demand.dto.CreateRideFromDemandDto;
import Student_ride_sharing.demand.dto.RideResponseDto;
import Student_ride_sharing.demand.entity.*;
import Student_ride_sharing.demand.repository.BookingRepository;
import Student_ride_sharing.demand.repository.RideRepository;
import Student_ride_sharing.demand.repository.RideRequestRepository;
import Student_ride_sharing.demand.repository.UserRepository;
import Student_ride_sharing.demand.service.BookingService;
import Student_ride_sharing.demand.service.RideService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RideServiceImpl implements RideService {

    private final RideRepository rideRepository;
    private final RideRequestRepository rideRequestRepository;
    private final BookingService bookingService;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public RideResponseDto acceptDemandAndCreateRide(CreateRideFromDemandDto dto) {

        // 1. Strict Query matching the precise metadata and the 30-minute rounded time block
        List<RideRequest> matchingRequests = rideRequestRepository.findMatchingRequestsForRideCreation(
                dto.getSource(),
                dto.getDestination(),
                dto.getVehicleType().name(),
                dto.getPreferredTime()
        );

        // Fetch driver entity from database to establish relational integrity checks
        User driver = userRepository.findById(dto.getDriverId())
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        Ride ride = new Ride();
        ride.setDriver(driver); // Now fully bound cleanly from the database entity mapping
        ride.setSource(dto.getSource());
        ride.setDestination(dto.getDestination());
        ride.setVehicleType(dto.getVehicleType());
        ride.setDepartureTime(LocalDateTime.now());
        ride.setTotalSeats(dto.getTotalSeats());
        ride.setOccupiedSeats(0);

        Ride savedRide = rideRepository.save(ride);

        int currentOccupied = 0;

        // 2. Pure First-Come, First-Served evaluation queue (ordered by r.created_at ASC)
        for (RideRequest request : matchingRequests) {
            if (currentOccupied < dto.getTotalSeats()) {

                // Change status to FULFILLED so they clear out of the active grouped clusters
                request.setStatus(RequestStatus.FULFILLED);
                rideRequestRepository.save(request);

                // Calls the automated overloaded method to safely pass the live entity reference
                bookingService.createAutomatedBookingForCluster(request.getStudent().getId(), savedRide);
                currentOccupied++;
            }
        }

        // 3. Persist the final calculated seat variables accurately
        savedRide.setOccupiedSeats(currentOccupied);
        Ride finalRide = rideRepository.save(savedRide);

        // 4. Transform into our output Response DTO structure via ModelMapper
        RideResponseDto responseDto = modelMapper.map(finalRide, RideResponseDto.class);
        responseDto.setAvailableSeats(finalRide.getTotalSeats() - finalRide.getOccupiedSeats());

        return responseDto;
    }

    @Override
    @Transactional
    public void cancelRideByDriver(Long rideId) {
        // 1. Fetch the targeted ride
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride record not found"));

        // 2. Fetch all student bookings confirmed for this ride
        List<Booking> activeBookings = bookingRepository.findByRideIdAndStatus(rideId, BookingStatus.CONFIRMED);

        // 3. Process the domino-effect rollback loop
        for (Booking booking : activeBookings) {
            // A. Flip the student's confirmation ticket to CANCELLED
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            // B. Revert the student's original demand request back to PENDING loop-free
            User student = booking.getStudent();

            RideRequest fulfilledRequest = rideRequestRepository
                    .findByStudentIdAndSourceAndDestinationAndStatus(
                            student.getId(),
                            ride.getSource(),
                            ride.getDestination(),
                            RequestStatus.FULFILLED
                    );

            // Re-inject them back into the active FCFS dashboard pool instantly if found
            if (fulfilledRequest != null) {
                fulfilledRequest.setStatus(RequestStatus.PENDING);
                rideRequestRepository.save(fulfilledRequest);
            }
        }

        // 4. HARD DELETE THE RIDE ROW COMPLETELY
        rideRepository.delete(ride);
    }
}