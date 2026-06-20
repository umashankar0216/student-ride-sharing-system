package Student_ride_sharing.demand.dto;

import Student_ride_sharing.demand.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {
    private Long id;
    private BookingStatus status; // CONFIRMED or CANCELLED [cite: 1228]

    // Nested objects to return clean, filtered student and ride details
    private UserResponseDto user;
    private RideResponseDto ride;
}