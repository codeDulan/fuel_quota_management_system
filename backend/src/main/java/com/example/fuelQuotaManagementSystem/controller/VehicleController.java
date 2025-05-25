package com.example.fuelQuotaManagementSystem.controller;

import com.example.fuelQuotaManagementSystem.dto.DMTVehicleInfo;
import com.example.fuelQuotaManagementSystem.dto.MessageResponse;
import com.example.fuelQuotaManagementSystem.dto.VehicleRegistrationRequest;
import com.example.fuelQuotaManagementSystem.dto.VehicleResponse;
import com.example.fuelQuotaManagementSystem.entity.User;
import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import com.example.fuelQuotaManagementSystem.repository.UserRepository;
import com.example.fuelQuotaManagementSystem.repository.VehicleRepository;
import com.example.fuelQuotaManagementSystem.security.UserDetailsImpl;
import com.example.fuelQuotaManagementSystem.service.MotorTrafficService;
import com.example.fuelQuotaManagementSystem.service.QRCodeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MotorTrafficService motorTrafficService;

    @Autowired
    private QRCodeService qrCodeService;


     //Register a new vehicle (Vehicle Owner only)

    @PostMapping("/register")
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    public ResponseEntity<?> registerVehicle(@Valid @RequestBody VehicleRegistrationRequest request,
                                             Authentication authentication) {
        try {
            // Get current user
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<User> userOptional = userRepository.findById(userDetails.getId());

            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("User not found!"));
            }

            User currentUser = userOptional.get();

            // Check if vehicle is already registered in our system
            if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle is already registered in the fuel quota system!"));
            }

            // Validate with DMT
            Optional<DMTVehicleInfo> dmtInfo = motorTrafficService.validateVehicle(
                    request.getRegistrationNumber(),
                    request.getChassisNumber()
            );

            if (!dmtInfo.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle validation failed! Please check your registration number and chassis number."));
            }

            DMTVehicleInfo vehicleInfo = dmtInfo.get();

            // Check if vehicle is active in DMT
            if (!"Active".equals(vehicleInfo.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle is not active in DMT records. Status: " + vehicleInfo.getStatus()));
            }

            // Create new vehicle record
            Vehicle vehicle = new Vehicle();
            vehicle.setRegistrationNumber(vehicleInfo.getRegistrationNumber());
            vehicle.setChassisNumber(vehicleInfo.getChassisNumber());
            vehicle.setVehicleType(vehicleInfo.getVehicleType());
            vehicle.setFuelType(vehicleInfo.getFuelType());
            vehicle.setEngineCapacity(vehicleInfo.getEngineCapacity());
            vehicle.setOwner(currentUser);

            // Generate QR code
            String qrCodeData = qrCodeService.generateQRCode(vehicle);
            vehicle.setQrCode(qrCodeData);

            // Save vehicle
            Vehicle savedVehicle = vehicleRepository.save(vehicle);

            return ResponseEntity.ok(new VehicleResponse(
                    savedVehicle.getId(),
                    savedVehicle.getRegistrationNumber(),
                    savedVehicle.getVehicleType(),
                    savedVehicle.getFuelType(),
                    savedVehicle.getEngineCapacity(),
                    vehicleInfo.getMake(),
                    vehicleInfo.getModel(),
                    vehicleInfo.getYear(),
                    "Vehicle registered successfully! QR code generated."
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error registering vehicle: " + e.getMessage()));
        }
    }


     //Get all vehicles for current user (Vehicle Owner only)

    @GetMapping("/my-vehicles")
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    public ResponseEntity<?> getMyVehicles(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Vehicle> vehicles = vehicleRepository.findByOwnerId(userDetails.getId());

            List<VehicleResponse> vehicleResponses = vehicles.stream()
                    .map(this::convertToVehicleResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(vehicleResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching vehicles: " + e.getMessage()));
        }
    }


     //Scan QR code and get vehicle details (For mobile app - Station owners/operators)

    @GetMapping("/scan/{qrData}")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> scanVehicleQR(@PathVariable String qrData) {
        try {
            // Decode QR and extract registration number
            String registrationNumber = qrCodeService.decodeQRCode(qrData);

            Optional<Vehicle> vehicleOptional = vehicleRepository.findByRegistrationNumber(registrationNumber);

            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found or QR code invalid!"));
            }

            Vehicle vehicle = vehicleOptional.get();

            // Get additional info from DMT if needed
            Optional<DMTVehicleInfo> dmtInfo = motorTrafficService.getVehicleInfo(registrationNumber);

            VehicleResponse response = convertToVehicleResponse(vehicle);
            if (dmtInfo.isPresent()) {
                response.setMake(dmtInfo.get().getMake());
                response.setModel(dmtInfo.get().getModel());
                response.setYear(dmtInfo.get().getYear());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error scanning QR code: " + e.getMessage()));
        }
    }


     //Get vehicle details by ID (Admin only)

    @GetMapping("/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVehicleById(@PathVariable Long vehicleId) {
        try {
            Optional<Vehicle> vehicleOptional = vehicleRepository.findById(vehicleId);

            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found!"));
            }

            Vehicle vehicle = vehicleOptional.get();
            return ResponseEntity.ok(convertToVehicleResponse(vehicle));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching vehicle: " + e.getMessage()));
        }
    }


     //Get all vehicles (Admin only)

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllVehicles() {
        try {
            List<Vehicle> vehicles = vehicleRepository.findAll();

            List<VehicleResponse> vehicleResponses = vehicles.stream()
                    .map(this::convertToVehicleResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(vehicleResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching vehicles: " + e.getMessage()));
        }
    }


     //Validate vehicle without registration

    @PostMapping("/validate")
    public ResponseEntity<?> validateVehicle(@Valid @RequestBody VehicleRegistrationRequest request) {
        try {
            Optional<DMTVehicleInfo> dmtInfo = motorTrafficService.validateVehicle(
                    request.getRegistrationNumber(),
                    request.getChassisNumber()
            );

            if (!dmtInfo.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found in DMT records!"));
            }

            DMTVehicleInfo vehicleInfo = dmtInfo.get();
            return ResponseEntity.ok(vehicleInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error validating vehicle: " + e.getMessage()));
        }
    }


     //Helper method to convert Vehicle entity to VehicleResponse DTO

    private VehicleResponse convertToVehicleResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();

        // Vehicle basic info
        response.setId(vehicle.getId());
        response.setRegistrationNumber(vehicle.getRegistrationNumber());
        response.setVehicleType(vehicle.getVehicleType());
        response.setFuelType(vehicle.getFuelType());
        response.setEngineCapacity(vehicle.getEngineCapacity());
        response.setStatus("Active");
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());

        // Owner information
        if (vehicle.getOwner() != null) {
            response.setOwnerName(vehicle.getOwner().getFullName());
            response.setOwnerEmail(vehicle.getOwner().getEmail());
            response.setOwnerPhone(vehicle.getOwner().getPhoneNumber());
        }


        response.setMake(null);
        response.setModel(null);
        response.setYear(null);

        return response;
    }
}