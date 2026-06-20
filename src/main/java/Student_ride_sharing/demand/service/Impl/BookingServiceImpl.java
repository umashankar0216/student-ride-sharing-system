package Student_ride_sharing.demand.service.Impl;

import Student_ride_sharing.demand.dto.BookingResponseDto;
import Student_ride_sharing.demand.entity.Booking;
import Student_ride_sharing.demand.entity.BookingStatus;
import Student_ride_sharing.demand.entity.Ride;
import Student_ride_sharing.demand.entity.User;
import Student_ride_sharing.demand.repository.BookingRepository;
import Student_ride_sharing.demand.repository.RideRepository;
import Student_ride_sharing.demand.repository.UserRepository; // Make sure this path is right
import Student_ride_sharing.demand.repository.UserRepository;
import Student_ride_sharing.demand.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    // 1. Individual Manual Student Booking (Kept exactly as you wrote it)
    @Override
    @Transactional
    public BookingResponseDto createBooking(Long studentId, Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (ride.getOccupiedSeats() >= ride.getTotalSeats()) {
            throw new RuntimeException("This ride is completely full!");
        }

        ride.setOccupiedSeats(ride.getOccupiedSeats() + 1);
        Ride updatedRide = rideRepository.save(ride);

        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setRide(updatedRide);
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking savedBooking = bookingRepository.save(booking);

        BookingResponseDto response = modelMapper.map(savedBooking, BookingResponseDto.class);
        response.getRide().setTotalCapacity(updatedRide.getTotalSeats());
        response.getRide().setOccupiedSeats(updatedRide.getOccupiedSeats());
        response.getRide().setAvailableSeats(updatedRide.getTotalSeats() - updatedRide.getOccupiedSeats());

        return response;
    }

    // 2. New Overloaded Method: Handles automated ticket generation for driver demand clusters safely
    @Override
    @Transactional
    public void createAutomatedBookingForCluster(Long studentId, Ride ride) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setRide(ride); // Uses the live ride object directly managed by RideServiceImpl
        booking.setStatus(BookingStatus.CONFIRMED);

        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking record not found"));

        booking.setStatus(BookingStatus.CANCELLED);

        Ride ride = booking.getRide();
        if (ride.getOccupiedSeats() > 0) {
            ride.setOccupiedSeats(ride.getOccupiedSeats() - 1);
            rideRepository.save(ride);
        }

        bookingRepository.save(booking);
    }
}