package Student_ride_sharing.demand.service.Impl;

import Student_ride_sharing.demand.dto.GroupedRequestDTO;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class RideRequestServiceImpl implements RideRequestService {

    private final RideRequestRepository rideRequestRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public RideRequestDto createRequest(RideRequestDto dto) {

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        User student = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Logged in student record not found"));


        RideRequest request = modelMapper.map(dto, RideRequest.class);

        request.setStudent(student);
        request.setStatus(RequestStatus.PENDING);

        request.setPrice(dto.getPrice());

        RideRequest savedRequest = rideRequestRepository.save(request);

        return modelMapper.map(savedRequest, RideRequestDto.class);
    }

    @Override
    public List<GroupedRequestDTO> getGroupedDemandsForDrivers() {
        return rideRequestRepository.findGroupedPendingRequests();
    }
}