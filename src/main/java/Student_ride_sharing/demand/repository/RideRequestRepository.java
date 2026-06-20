package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.dto.GroupedRequestDTO;
import Student_ride_sharing.demand.entity.RequestStatus;
import Student_ride_sharing.demand.entity.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {

    // 1. Aggregates data blocks to form clustered request groupings for the Driver Dashboard
    @Query(value = "SELECT r.source AS source, r.destination AS destination, " +
            "r.preferred_vehicle AS preferredVehicle, " +
            "CONCAT(FORMATDATETIME(r.preferred_time, 'yyyy-MM-dd HH:'), " +
            "(CASE WHEN MINUTE(r.preferred_time) < 30 THEN '00' ELSE '30' END)) AS timeSlot, " +
            "COUNT(r.id) AS studentCount " +
            "FROM ride_requests r " +
            "WHERE r.status = 'PENDING' " +
            "GROUP BY r.source, r.destination, r.preferred_vehicle, " +
            "FORMATDATETIME(r.preferred_time, 'yyyy-MM-dd HH:'), " +
            "CASE WHEN MINUTE(r.preferred_time) < 30 THEN '00' ELSE '30' END " +
            "HAVING COUNT(r.id) >= 3", nativeQuery = true)
    List<GroupedRequestDTO> findGroupedPendingRequests();

    // 2. Strict selection query fetching live entity requests inside the matching 30-min window in FCFS order
    @Query(value = "SELECT r.* FROM ride_requests r " +
            "WHERE r.source = :source " +
            "AND r.destination = :destination " +
            "AND r.preferred_vehicle = :preferredVehicle " +
            "AND r.status = 'PENDING' " +
            "AND FORMATDATETIME(r.preferred_time, 'yyyy-MM-dd HH:') = FORMATDATETIME(:targetTime, 'yyyy-MM-dd HH:') " +
            "AND (CASE WHEN MINUTE(r.preferred_time) < 30 THEN '00' ELSE '30' END) = (CASE WHEN MINUTE(:targetTime) < 30 THEN '00' ELSE '30' END) " +
            "ORDER BY r.created_at ASC", nativeQuery = true)
    List<RideRequest> findMatchingRequestsForRideCreation(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("preferredVehicle") String preferredVehicle,
            @Param("targetTime") LocalDateTime targetTime
    );

    // 3. Loop-free single row lookup utility for driver trip cancellations rollback logic
    RideRequest findByStudentIdAndSourceAndDestinationAndStatus(
            Long studentId,
            String source,
            String destination,
            RequestStatus status
    );
}