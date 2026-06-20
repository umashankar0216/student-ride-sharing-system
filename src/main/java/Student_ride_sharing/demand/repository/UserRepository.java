package Student_ride_sharing.demand.repository;

import Student_ride_sharing.demand.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during login and JWT generation to find a user by their unique university email
    Optional<User> findByEmail(String email);

    // Used during registration to check if a username is already taken before saving
    Optional<User> findByUsername(String username);

    // Checks if an email exists in the database (returns true or false)
    Boolean existsByEmail(String email);

    // Checks if a username exists in the database
    Boolean existsByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);
}