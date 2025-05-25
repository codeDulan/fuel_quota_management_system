package com.example.fuelQuotaManagementSystem.controller;

import com.example.fuelQuotaManagementSystem.dto.FuelPumpRequest;
import com.example.fuelQuotaManagementSystem.dto.FuelQuotaResponse;
import com.example.fuelQuotaManagementSystem.dto.MessageResponse;
import com.example.fuelQuotaManagementSystem.entity.FuelStation;
import com.example.fuelQuotaManagementSystem.entity.FuelTransaction;
import com.example.fuelQuotaManagementSystem.entity.User;
import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import com.example.fuelQuotaManagementSystem.repository.FuelStationRepository;
import com.example.fuelQuotaManagementSystem.repository.FuelTransactionRepository;
import com.example.fuelQuotaManagementSystem.repository.UserRepository;
import com.example.fuelQuotaManagementSystem.repository.VehicleRepository;
import com.example.fuelQuotaManagementSystem.security.UserDetailsImpl;
import com.example.fuelQuotaManagementSystem.service.FuelQuotaService;
import com.example.fuelQuotaManagementSystem.service.NotificationService;
import com.example.fuelQuotaManagementSystem.service.QRCodeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/fuel")
public class FuelQuotaController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private FuelStationRepository fuelStationRepository;

    @Autowired
    private FuelTransactionRepository fuelTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FuelQuotaService fuelQuotaService;

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private NotificationService notificationService;


     //Check fuel quota for a vehicle by QR code scan (Mobile App - Station Operators)

    @GetMapping("/quota/scan/{qrData}")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkQuotaByQR(@PathVariable String qrData) {
        try {
            String registrationNumber;

            // Try to decode as QR code first, if that fails, treat as plain registration number
            try {
                // Attempt to decode as QR code
                registrationNumber = qrCodeService.decodeQRCode(qrData);
            } catch (Exception qrException) {
                // If QR decoding fails, treat input as plain registration number
                registrationNumber = qrData.toUpperCase().trim();

                // Basic validation for registration number format
                if (registrationNumber.length() < 3 || registrationNumber.length() > 20) {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("Invalid QR code or registration number format!"));
                }
            }

            // Find vehicle by registration number
            Optional<Vehicle> vehicleOptional = vehicleRepository.findByRegistrationNumber(registrationNumber);
            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found! Registration: " + registrationNumber +
                                ". Please ensure the vehicle is registered in the fuel quota system."));
            }

            Vehicle vehicle = vehicleOptional.get();

            // Get quota information for vehicle's fuel type
            FuelQuotaService.FuelQuotaInfo quotaInfo = fuelQuotaService.getQuotaInfo(vehicle, vehicle.getFuelType());

            FuelQuotaResponse response = new FuelQuotaResponse(
                    vehicle.getId(),
                    vehicle.getRegistrationNumber(),
                    vehicle.getVehicleType(),
                    vehicle.getFuelType(),
                    vehicle.getEngineCapacity(),
                    vehicle.getOwner().getFullName(),
                    vehicle.getOwner().getPhoneNumber(),
                    quotaInfo.getAllocatedQuota(),
                    quotaInfo.getRemainingQuota(),
                    quotaInfo.getUsedQuota(),
                    quotaInfo.getUsagePercentage(),
                    quotaInfo.isExpiringSoon(),
                    formatTimestamp(quotaInfo.getStartDate()),
                    formatTimestamp(quotaInfo.getEndDate())
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error checking quota: " + e.getMessage()));
        }
    }


     //Check fuel quota by vehicle ID (Web Portal - Vehicle Owners)

    @GetMapping("/quota/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('VEHICLE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkQuotaByVehicleId(@PathVariable Long vehicleId, Authentication authentication) {
        try {
            Optional<Vehicle> vehicleOptional = vehicleRepository.findById(vehicleId);
            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found!"));
            }

            Vehicle vehicle = vehicleOptional.get();

            // Check if user owns this vehicle (unless admin)
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !vehicle.getOwner().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Access denied: You don't own this vehicle!"));
            }

            // Get quota information
            FuelQuotaService.FuelQuotaInfo quotaInfo = fuelQuotaService.getQuotaInfo(vehicle, vehicle.getFuelType());

            FuelQuotaResponse response = new FuelQuotaResponse(
                    vehicle.getId(),
                    vehicle.getRegistrationNumber(),
                    vehicle.getVehicleType(),
                    vehicle.getFuelType(),
                    vehicle.getEngineCapacity(),
                    vehicle.getOwner().getFullName(),
                    vehicle.getOwner().getPhoneNumber(),
                    quotaInfo.getAllocatedQuota(),
                    quotaInfo.getRemainingQuota(),
                    quotaInfo.getUsedQuota(),
                    quotaInfo.getUsagePercentage(),
                    quotaInfo.isExpiringSoon(),
                    formatTimestamp(quotaInfo.getStartDate()),
                    formatTimestamp(quotaInfo.getEndDate())
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error checking quota: " + e.getMessage()));
        }
    }


     //Record fuel pumping transaction

    @PostMapping("/pump")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> recordFuelPump(@Valid @RequestBody FuelPumpRequest request,
                                            Authentication authentication) {
        try {
            // Get current user (station operator)
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<User> userOptional = userRepository.findById(userDetails.getId());
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("User not found!"));
            }

            // Find vehicle
            Optional<Vehicle> vehicleOptional = vehicleRepository.findById(request.getVehicleId());
            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found!"));
            }

            Vehicle vehicle = vehicleOptional.get();

            // Find fuel station
            Optional<FuelStation> stationOptional = fuelStationRepository.findById(request.getStationId());
            if (!stationOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Fuel station not found!"));
            }

            FuelStation station = stationOptional.get();

            // Validate fuel type matches vehicle
            if (!vehicle.getFuelType().equalsIgnoreCase(request.getFuelType())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Fuel type mismatch! Vehicle uses " + vehicle.getFuelType()));
            }

            // Validate pump amount
            if (request.getAmount() <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Invalid fuel amount!"));
            }

            if (request.getAmount() > 100) { // Maximum 100L per transaction
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Maximum 100 liters allowed per transaction!"));
            }

            // Check if vehicle has sufficient quota
            if (!fuelQuotaService.hasSufficientQuota(vehicle, request.getFuelType(), request.getAmount())) {
                double remainingQuota = fuelQuotaService.getRemainingQuota(vehicle, request.getFuelType());
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Insufficient quota! Remaining: " + remainingQuota + "L"));
            }

            // Get quota before transaction
            double quotaBefore = fuelQuotaService.getRemainingQuota(vehicle, request.getFuelType());

            // Deduct fuel from quota
            boolean success = fuelQuotaService.deductFuel(vehicle, request.getFuelType(), request.getAmount());
            if (!success) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Failed to deduct fuel quota!"));
            }

            // Get quota after transaction
            double quotaAfter = fuelQuotaService.getRemainingQuota(vehicle, request.getFuelType());

            // Create transaction record
            FuelTransaction transaction = new FuelTransaction();
            transaction.setVehicle(vehicle);
            transaction.setStation(station);
            transaction.setFuelType(request.getFuelType());
            transaction.setAmount(request.getAmount());
            transaction.setQuotaBeforeTransaction(quotaBefore);
            transaction.setQuotaAfterTransaction(quotaAfter);
            transaction.setNotificationSent(false);

            FuelTransaction savedTransaction = fuelTransactionRepository.save(transaction);

            // Send notification to vehicle owner
            try {
                boolean notificationSent = notificationService.sendFuelTransactionNotification(
                        vehicle.getOwner().getPhoneNumber(),
                        vehicle.getOwner().getEmail(),
                        vehicle.getRegistrationNumber(),
                        request.getFuelType(),
                        request.getAmount(),
                        station.getName(),
                        quotaAfter,
                        savedTransaction.getId()
                );

                // Update notification status
                savedTransaction.setNotificationSent(notificationSent);
                fuelTransactionRepository.save(savedTransaction);

            } catch (Exception e) {
                // Log notification error but don't fail the transaction
                System.err.println("Failed to send notification: " + e.getMessage());
                savedTransaction.setNotificationSent(false);
                fuelTransactionRepository.save(savedTransaction);
            }

            return ResponseEntity.ok(new MessageResponse(
                    String.format("Fuel pumped successfully! %.1fL %s dispensed. Remaining quota: %.1fL",
                            request.getAmount(), request.getFuelType(), quotaAfter)
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error recording fuel pump: " + e.getMessage()));
        }
    }


     //Get fuel transaction history for a vehicle (Vehicle Owner)

    @GetMapping("/transactions/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('VEHICLE_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getVehicleTransactions(@PathVariable Long vehicleId, Authentication authentication) {
        try {
            Optional<Vehicle> vehicleOptional = vehicleRepository.findById(vehicleId);
            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found!"));
            }

            Vehicle vehicle = vehicleOptional.get();

            // Check ownership (unless admin)
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !vehicle.getOwner().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Access denied: You don't own this vehicle!"));
            }

            List<FuelTransaction> transactions = fuelTransactionRepository.findByVehicleIdOrderByTimestampDesc(vehicleId);

            return ResponseEntity.ok(transactions.stream()
                    .map(this::convertToTransactionResponse)
                    .collect(Collectors.toList()));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching transactions: " + e.getMessage()));
        }
    }


     //Get all transactions for a fuel station (Station Owner)

    @GetMapping("/transactions/station/{stationId}")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getStationTransactions(@PathVariable Long stationId, Authentication authentication) {
        try {
            Optional<FuelStation> stationOptional = fuelStationRepository.findById(stationId);
            if (!stationOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Fuel station not found!"));
            }

            // Check station ownership (unless admin)
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            FuelStation station = stationOptional.get();
            if (!isAdmin && !station.getOwner().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Access denied: You don't own this fuel station!"));
            }

            List<FuelTransaction> transactions = fuelTransactionRepository.findByStationIdOrderByTimestampDesc(stationId);

            return ResponseEntity.ok(transactions.stream()
                    .map(this::convertToTransactionResponse)
                    .collect(Collectors.toList()));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching station transactions: " + e.getMessage()));
        }
    }


     //Reset vehicle quota (Admin only - for testing)

    @PostMapping("/quota/reset/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetVehicleQuota(@PathVariable Long vehicleId) {
        try {
            Optional<Vehicle> vehicleOptional = vehicleRepository.findById(vehicleId);
            if (!vehicleOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Vehicle not found!"));
            }

            Vehicle vehicle = vehicleOptional.get();
            fuelQuotaService.resetQuota(vehicle, vehicle.getFuelType());

            return ResponseEntity.ok(new MessageResponse("Vehicle quota reset successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error resetting quota: " + e.getMessage()));
        }
    }


     //Helper method to convert FuelTransaction to response DTO

    private Object convertToTransactionResponse(FuelTransaction transaction) {
        return new Object() {
            public final Long id = transaction.getId();
            public final String vehicleRegNo = transaction.getVehicle().getRegistrationNumber();
            public final String stationName = transaction.getStation().getName();
            public final String fuelType = transaction.getFuelType();
            public final Double amount = transaction.getAmount();
            public final Double quotaBefore = transaction.getQuotaBeforeTransaction();
            public final Double quotaAfter = transaction.getQuotaAfterTransaction();
            public final Boolean notificationSent = transaction.isNotificationSent(); // Fixed: using isNotificationSent()
            public final String timestamp = formatTimestamp(transaction.getTimestamp());
        };
    }


     //Helper method to format timestamp

    private String formatTimestamp(Long timestamp) {
        if (timestamp == null) return null;
        return LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(timestamp),
                java.time.ZoneId.systemDefault()
        ).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}