package Student_ride_sharing.demand.service.Impl;

import Student_ride_sharing.demand.dto.LoginDto;
import Student_ride_sharing.demand.dto.RegisterDto;
import Student_ride_sharing.demand.entity.Roles;
import Student_ride_sharing.demand.entity.User;
import Student_ride_sharing.demand.repository.RoleRepository;
import Student_ride_sharing.demand.repository.UserRepository;
import Student_ride_sharing.demand.security.JwtTokenProvider;
import Student_ride_sharing.demand.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {
    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtTokenProvider jwtTokenProvider;




    @Override
    public String register(RegisterDto registerDto) {



        User user = new User();
        user.setUsername(registerDto.getUserName());
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        Set<Roles> roles = new HashSet<>();

        Roles userrole = roleRepository.findByName("ROLE_STUDENT");
        roles.add(userrole);

        user.setRoles(roles);
        userRepository.save(user);




        return " the user registered succefully";
    }

    @Override
    public String login(LoginDto loginDto) {


        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.getUserNameOrEmail(),
                loginDto.getPassword()
        ));


        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);
        return token;

    }
}
