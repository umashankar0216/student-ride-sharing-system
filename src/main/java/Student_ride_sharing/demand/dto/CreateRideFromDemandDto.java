package Student_ride_sharing.demand.dto;

import Student_ride_sharing.demand.entity.VehicleType;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateRideFromDemandDto {
    private List<String> selectedUsernames;
    private Long existingRideId;
    private String source;
    private String destination;
    private VehicleType vehicleType;
    private LocalDateTime preferredTime;
    private int totalSeats;
    private BigDecimal price;
}