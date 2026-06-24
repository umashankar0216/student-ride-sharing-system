package Student_ride_sharing.demand.service.Impl;

import Student_ride_sharing.demand.dto.GroupedRequestDTO;
import Student_ride_sharing.demand.dto.RideRequestDetailedDto;
import Student_ride_sharing.demand.dto.RideRequestDto;
import Student_ride_sharing.demand.entity.RequestStatus;
import Student_ride_sharing.demand.entity.RideRequest;
import Student_ride_sharing.demand.entity.User;
import Student_ride_sharing.demand.repository.RideRequestRepository;
import Student_ride_sharing.demand.repository.UserRepository;
import Student_ride_sharing.demand.service.RideRequestService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RideRequestServiceImpl implements RideRequestService {

    private final RideRequestRepository rideRequestRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public RideRequestDto createRequest(RideRequestDto dto) {
        // 1. Resolve logged-in student username from security context principal token session
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        User student = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Logged in student record not found"));

        // 2. Map payload properties automatically via ModelMapper
        RideRequest request = modelMapper.map(dto, RideRequest.class);

        // 🟢 FIX: Explicitly strip any ID value ModelMapper might have misconfigured or cached!
        // This guarantees Hibernate maps this transaction exclusively to a SQL INSERT operation.
        request.setId(null);

        // 3. Bind permanent state variables and student relationship pointers
        request.setStudent(student);
        request.setStatus(RequestStatus.PENDING);

        // 🟢 FIX: Ensure price maps exactly to the matching flat price field on your Entity
        request.setPrice(dto.getPrice());

        // 4. Save cleanly into your database dashboard tables
        RideRequest savedRequest = rideRequestRepository.save(request);

        // 5. Build mapped transfer object response payload structure back to your React app client
        return modelMapper.map(savedRequest, RideRequestDto.class);
    }

    @Override
    public List<GroupedRequestDTO> getGroupedDemandsForDrivers() {
        return rideRequestRepository.findGroupedPendingRequests();
    }
}