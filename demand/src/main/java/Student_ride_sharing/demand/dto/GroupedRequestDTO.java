package Student_ride_sharing.demand.dto;

import Student_ride_sharing.demand.entity.VehicleType;

public interface GroupedRequestDTO {
    String getSource();
    String getDestination();
    VehicleType getVehicleType();
    Long getStudentCount();
}