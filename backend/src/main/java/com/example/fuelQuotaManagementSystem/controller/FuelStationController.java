package com.example.fuelQuotaManagementSystem.controller;

import com.example.fuelQuotaManagementSystem.dto.fuelStation.FuelStationRegistrationRequest;
import com.example.fuelQuotaManagementSystem.dto.fuelStation.FuelStationResponse;
import com.example.fuelQuotaManagementSystem.dto.MessageResponse;
import com.example.fuelQuotaManagementSystem.dto.fuelStation.StationDashboardResponse;
import com.example.fuelQuotaManagementSystem.entity.FuelStation;
import com.example.fuelQuotaManagementSystem.entity.User;
import com.example.fuelQuotaManagementSystem.repository.UserRepository;
import com.example.fuelQuotaManagementSystem.security.UserDetailsImpl;
import com.example.fuelQuotaManagementSystem.service.FuelStationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/station")
public class FuelStationController {

    @Autowired
    private FuelStationService fuelStationService;

    @Autowired
    private UserRepository userRepository;


     //Register a new fuel station (Station Owner only)

    @PostMapping("/register")
    @PreAuthorize("hasRole('STATION_OWNER')")
    public ResponseEntity<?> registerFuelStation(@Valid @RequestBody FuelStationRegistrationRequest request,
                                                 Authentication authentication) {
        try {
            // Get current user
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<User> userOptional = userRepository.findById(userDetails.getId());

            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("User not found!"));
            }

            User stationOwner = userOptional.get();

            // Use service to register station
            FuelStation savedStation = fuelStationService.registerStation(request, stationOwner);

            return ResponseEntity.ok(convertToStationResponse(savedStation));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error registering fuel station: " + e.getMessage()));
        }
    }


     //Get fuel stations owned by current user (Station Owner only)

    @GetMapping("/my-stations")
    @PreAuthorize("hasRole('STATION_OWNER')")
    public ResponseEntity<?> getMyStations(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<FuelStation> stations = fuelStationService.getStationsByOwner(userDetails.getId());

            List<FuelStationResponse> stationResponses = stations.stream()
                    .map(this::convertToStationResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(stationResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching stations: " + e.getMessage()));
        }
    }


     //Get all fuel stations (Admin only)

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllStations() {
        try {
            List<FuelStation> stations = fuelStationService.getAllStations();

            List<FuelStationResponse> stationResponses = stations.stream()
                    .map(this::convertToStationResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(stationResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching stations: " + e.getMessage()));
        }
    }


     //Get fuel station by ID

    @GetMapping("/{stationId}")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getStationById(@PathVariable Long stationId, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            FuelStation station = fuelStationService.getStationById(stationId, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(convertToStationResponse(station));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching station: " + e.getMessage()));
        }
    }


     //Update fuel station information

    @PutMapping("/{stationId}")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStation(@PathVariable Long stationId,
                                           @Valid @RequestBody FuelStationRegistrationRequest request,
                                           Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            FuelStation updatedStation = fuelStationService.updateStation(stationId, request, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(convertToStationResponse(updatedStation));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating station: " + e.getMessage()));
        }
    }


     //Activate/Deactivate fuel station (Admin only)

    @PutMapping("/{stationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStationStatus(@PathVariable Long stationId,
                                                 @RequestParam boolean active) {
        try {
            fuelStationService.updateStationStatus(stationId, active);
            String statusMessage = active ? "activated" : "deactivated";
            return ResponseEntity.ok(new MessageResponse("Station " + statusMessage + " successfully!"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating station status: " + e.getMessage()));
        }
    }




     //Get fuel station dashboard with transaction stats

    @GetMapping("/{stationId}/dashboard")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getStationDashboard(@PathVariable Long stationId, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            StationDashboardResponse dashboard = fuelStationService.getStationDashboard(stationId, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(dashboard);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error generating dashboard: " + e.getMessage()));
        }
    }


     //Get station statistics for date range (Station Owner/Admin)

    @GetMapping("/{stationId}/statistics")
    @PreAuthorize("hasRole('STATION_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> getStationStatistics(@PathVariable Long stationId,
                                                  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                  Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            Object statistics = fuelStationService.getStationStatistics(stationId, startDate, endDate, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(statistics);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching statistics: " + e.getMessage()));
        }
    }


     //Get system-wide station analytics (Admin only)

    @GetMapping("/analytics/by-city")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStationCountByCity() {
        try {
            Object analytics = fuelStationService.getStationCountByCity();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching analytics: " + e.getMessage()));
        }
    }


     //Get station status summary (Admin only)

    @GetMapping("/analytics/status-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStationStatusSummary() {
        try {
            Object summary = fuelStationService.getStationStatusSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching status summary: " + e.getMessage()));
        }
    }


     //Helper method to convert FuelStation entity to FuelStationResponse DTO

    private FuelStationResponse convertToStationResponse(FuelStation station) {
        return new FuelStationResponse(
                station.getId(),
                station.getName(),
                station.getRegistrationNumber(),
                station.getAddress(),
                station.getCity(),
                station.getContactNumber(),
                station.getOwner().getFullName(),
                station.getOwner().getEmail(),
                station.isHasPetrol(),
                station.isHasDiesel(),
                station.isActive(),
                station.isActive() ? "Active" : "Inactive"
        );
    }
}