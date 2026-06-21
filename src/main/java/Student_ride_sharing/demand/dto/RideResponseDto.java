package Student_ride_sharing.demand.dto;

import Student_ride_sharing.demand.entity.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RideResponseDto {
    private Long id;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private Integer totalSeats;   // Initial maximum capacity of the vehicle
    private Integer occupiedSeats;   // Number of students currently booked
    private Integer availableSeats;  // Remaining open spots left in the vehicle
    private VehicleType vehicleType;
}