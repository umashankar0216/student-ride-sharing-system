package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.entity.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
}
