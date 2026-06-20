package Student_ride_sharing.demand.dto;

import Student_ride_sharing.demand.entity.VehicleType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateRideFromDemandDto {
    private Long driverId;
    private String source;
    private String destination;
    private VehicleType vehicleType;
    private LocalDateTime preferredTime; // Captured from the dashboard group row card
    private Integer totalSeats;          // Vehicle maximum capacity
}