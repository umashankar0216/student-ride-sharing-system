package Student_ride_sharing.demand.service;

import Student_ride_sharing.demand.dto.LoginDto;
import Student_ride_sharing.demand.dto.RegisterDto;

public interface AuthService {
    String register(RegisterDto registerDto);

    String login(LoginDto loginDto);
}