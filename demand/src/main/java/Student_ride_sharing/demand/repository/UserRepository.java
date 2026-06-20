package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
