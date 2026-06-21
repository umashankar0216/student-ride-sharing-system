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

    // 1. Aggregates data blocks to form clustered request groupings for the Driver Dashboard (PostgreSQL Fix)
    @Query(value = "SELECT r.source AS source, r.destination AS destination, " +
            "r.preferred_vehicle AS preferredVehicle, " +
            "CONCAT(TO_CHAR(r.preferred_time, 'YYYY-MM-DD HH24:'), " +
            "(CASE WHEN EXTRACT(MINUTE FROM r.preferred_time) < 30 THEN '00' ELSE '30' END)) AS timeSlot, " +
            "COUNT(r.id) AS studentCount " +
            "FROM ride_requests r " +
            "WHERE r.status = 'PENDING' " +
            "GROUP BY r.source, r.destination, r.preferred_vehicle, " +
            "TO_CHAR(r.preferred_time, 'YYYY-MM-DD HH24:'), " +
            "CASE WHEN EXTRACT(MINUTE FROM r.preferred_time) < 30 THEN '00' ELSE '30' END " +
            "HAVING COUNT(r.id) >= 3", nativeQuery = true)
    List<GroupedRequestDTO> findGroupedPendingRequests();

    // 2. Strict selection query fetching live entity requests inside the matching 30-min window in FCFS order (PostgreSQL Fix)
    // 2. Strict selection query fetching live entity requests inside the matching 30-min window in FCFS order (PostgreSQL Explicit Cast Fix)
// 2. Strict selection query fetching live entity requests inside the matching 30-min window in FCFS order (Standard Cast Fix)
    @Query(value = "SELECT r.* FROM ride_requests r " +
            "WHERE r.source = :source " +
            "AND r.destination = :destination " +
            "AND r.preferred_vehicle = :preferredVehicle " +
            "AND r.status = 'PENDING' " +
            "AND TO_CHAR(r.preferred_time, 'YYYY-MM-DD HH24:') = TO_CHAR(CAST(:targetTime AS timestamp), 'YYYY-MM-DD HH24:') " +
            "AND (CASE WHEN EXTRACT(MINUTE FROM r.preferred_time) < 30 THEN '00' ELSE '30' END) = " +
            "    (CASE WHEN EXTRACT(MINUTE FROM CAST(:targetTime AS timestamp)) < 30 THEN '00' ELSE '30' END) " +
            "ORDER BY r.created_at ASC", nativeQuery = true)
    List<RideRequest> findMatchingRequestsForRideCreation(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("preferredVehicle") String preferredVehicle,
            @Param("targetTime") LocalDateTime targetTime
    );

    RideRequest findByStudentIdAndSourceAndDestinationAndStatus(
            Long studentId,
            String source,
            String destination,
            RequestStatus status
    );
}