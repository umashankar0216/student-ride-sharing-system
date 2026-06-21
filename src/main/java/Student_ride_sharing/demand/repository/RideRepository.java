package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.dto.GroupedRequestDTO;
import Student_ride_sharing.demand.entity.RequestStatus;
import Student_ride_sharing.demand.entity.Ride;
import Student_ride_sharing.demand.entity.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    @Query(value = "SELECT r.* FROM rides r " +
            "WHERE r.source = :source " +
            "AND r.destination = :destination " +
            "AND r.vehicle_type = :vehicleType " +
            "AND r.total_seats > r.occupied_seats " +
            "AND TO_CHAR(r.departure_time, 'YYYY-MM-DD HH24:') = TO_CHAR(CAST(:preferredTime AS timestamp), 'YYYY-MM-DD HH24:') " +
            "AND (CASE WHEN EXTRACT(MINUTE FROM r.departure_time) < 30 THEN '00' ELSE '30' END) = " +
            "    (CASE WHEN EXTRACT(MINUTE FROM CAST(:preferredTime AS timestamp)) < 30 THEN '00' ELSE '30' END)",
            nativeQuery = true)
    List<Ride> searchAvailableRides(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("vehicleType") String vehicleType,
            @Param("preferredTime") LocalDateTime preferredTime
    );
}