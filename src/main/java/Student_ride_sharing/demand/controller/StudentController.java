package Student_ride_sharing.demand.controller;

import Student_ride_sharing.demand.dto.BookingResponseDto;
import Student_ride_sharing.demand.dto.RideRequestDto;
import Student_ride_sharing.demand.service.BookingService;
import Student_ride_sharing.demand.service.RideRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*") // Allows your React frontend to communicate with this API
@RequiredArgsConstructor
public class StudentController {

    private final RideRequestService rideRequestService;
    private final BookingService bookingService;

    // 1. Submit a new ride request to the demand pool
    @PostMapping("/requests")
    public ResponseEntity<RideRequestDto> createRideRequest(@RequestBody RideRequestDto dto) {
        RideRequestDto response = rideRequestService.createRequest(dto);
        return ResponseEntity.ok(response);
    }

    // 2. Manually book a single seat on an existing active ride
    @PostMapping("/{studentId}/bookings/{rideId}")
    public ResponseEntity<BookingResponseDto> bookRide(
            @PathVariable Long studentId,
            @PathVariable Long rideId) {
        BookingResponseDto response = bookingService.createBooking(studentId, rideId);
        return ResponseEntity.ok(response);
    }

    // 3. Cancel an existing booking
    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok("Booking successfully cancelled. The seat has been restored.");
    }
}