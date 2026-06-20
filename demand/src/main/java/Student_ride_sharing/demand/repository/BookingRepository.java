package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
