package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.entity.Booking;
import Student_ride_sharing.demand.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
   List<Booking> findByRideIdAndStatus(Long rideId, BookingStatus BookingStatus);
}
