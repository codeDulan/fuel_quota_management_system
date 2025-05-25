package com.example.fuelQuotaManagementSystem.controller;

import com.example.fuelQuotaManagementSystem.dto.admin.AdminDashboardResponse;
import com.example.fuelQuotaManagementSystem.dto.MessageResponse;
import com.example.fuelQuotaManagementSystem.dto.admin.UserManagementResponse;
import com.example.fuelQuotaManagementSystem.entity.Role;
import com.example.fuelQuotaManagementSystem.entity.User;
import com.example.fuelQuotaManagementSystem.repository.UserRepository;
import com.example.fuelQuotaManagementSystem.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;


    //Get admin dashboard with system overview

    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        try {
            AdminDashboardResponse dashboard = adminService.getSystemDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error generating admin dashboard: " + e.getMessage()));
        }
    }


     //Get all users in the system

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String role) {
        try {
            List<User> users;

            if (role != null && !role.isEmpty()) {
                users = adminService.getUsersByRole(role);
            } else {
                users = adminService.getAllUsers();
            }

            List<UserManagementResponse> userResponses = users.stream()
                    .map(this::convertToUserResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(userResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching users: " + e.getMessage()));
        }
    }


     //Get user details by ID

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = adminService.getUserById(userId);
            return ResponseEntity.ok(convertToUserResponse(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching user: " + e.getMessage()));
        }
    }


     //Update user roles

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long userId,
                                             @RequestBody Set<String> roles) {
        try {
            User updatedUser = adminService.updateUserRoles(userId, roles);
            return ResponseEntity.ok(new MessageResponse("User roles updated successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating user roles: " + e.getMessage()));
        }
    }


     //Activate or deactivate user account

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId,
                                              @RequestParam boolean active) {
        try {
            adminService.updateUserStatus(userId, active);
            String statusMessage = active ? "activated" : "deactivated";
            return ResponseEntity.ok(new MessageResponse("User account " + statusMessage + " successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating user status: " + e.getMessage()));
        }
    }


     //Get system-wide fuel consumption report

    @GetMapping("/reports/fuel-consumption")
    public ResponseEntity<?> getFuelConsumptionReport(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                      @RequestParam(required = false) String fuelType) {
        try {
            Object report = adminService.getFuelConsumptionReport(startDate, endDate, fuelType);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error generating fuel consumption report: " + e.getMessage()));
        }
    }


     //Get monthly quota utilization report

    @GetMapping("/reports/quota-utilization")
    public ResponseEntity<?> getQuotaUtilizationReport(@RequestParam(required = false) String month) {
        try {
            Object report = adminService.getQuotaUtilizationReport(month);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error generating quota utilization report: " + e.getMessage()));
        }
    }


     //Get vehicle registration trends

    @GetMapping("/reports/vehicle-registrations")
    public ResponseEntity<?> getVehicleRegistrationReport(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Object report = adminService.getVehicleRegistrationReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error generating vehicle registration report: " + e.getMessage()));
        }
    }


     //Get fuel station performance report

    @GetMapping("/reports/station-performance")
    public ResponseEntity<?> getStationPerformanceReport(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Object report = adminService.getStationPerformanceReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error generating station performance report: " + e.getMessage()));
        }
    }


     //Bulk allocate quotas for all vehicles

    @PostMapping("/quota/bulk-allocate")
    public ResponseEntity<?> bulkAllocateQuotas(@RequestParam String vehicleType,
                                                @RequestParam String fuelType,
                                                @RequestParam Double quotaAmount,
                                                @RequestParam String period) {
        try {
            int affectedVehicles = adminService.bulkAllocateQuotas(vehicleType, fuelType, quotaAmount, period);
            return ResponseEntity.ok(new MessageResponse("Quotas allocated successfully for " + affectedVehicles + " vehicles!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error allocating quotas: " + e.getMessage()));
        }
    }


     //Reset all quotas for current month (Emergency function)

    @PostMapping("/quota/reset-all")
    public ResponseEntity<?> resetAllQuotas(@RequestParam(required = false) String confirmationCode) {
        try {
            // Basic security check for dangerous operation
            if (!"RESET_ALL_QUOTAS_2025".equals(confirmationCode)) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Invalid confirmation code for quota reset!"));
            }

            int resetCount = adminService.resetAllQuotas();
            return ResponseEntity.ok(new MessageResponse("All quotas reset successfully! " + resetCount + " quotas were reset."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error resetting quotas: " + e.getMessage()));
        }
    }


     //Get system health status

    @GetMapping("/system/health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            Object healthStatus = adminService.getSystemHealthStatus();
            return ResponseEntity.ok(healthStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error checking system health: " + e.getMessage()));
        }
    }


     //Get notification system status and statistics

    @GetMapping("/system/notifications")
    public ResponseEntity<?> getNotificationStatus() {
        try {
            Object notificationStats = adminService.getNotificationStatistics();
            return ResponseEntity.ok(notificationStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching notification statistics: " + e.getMessage()));
        }
    }


     //Export system data (CSV format)

    @GetMapping("/export/transactions")
    public ResponseEntity<?> exportTransactionData(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                   @RequestParam(required = false) String format) {
        try {
            String exportData = adminService.exportTransactionData(startDate, endDate, format != null ? format : "CSV");

            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=fuel_transactions_" + startDate + "_to_" + endDate + ".csv")
                    .body(exportData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error exporting data: " + e.getMessage()));
        }
    }


     //Get top fuel-consuming vehicles

    @GetMapping("/analytics/top-consumers")
    public ResponseEntity<?> getTopFuelConsumers(@RequestParam(defaultValue = "10") int limit,
                                                 @RequestParam(required = false) String period) {
        try {
            Object topConsumers = adminService.getTopFuelConsumers(limit, period);
            return ResponseEntity.ok(topConsumers);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching top consumers: " + e.getMessage()));
        }
    }


     //Get system usage trends

    @GetMapping("/analytics/usage-trends")
    public ResponseEntity<?> getUsageTrends(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                            @RequestParam(required = false) String groupBy) {
        try {
            Object trends = adminService.getSystemUsageTrends(startDate, endDate, groupBy != null ? groupBy : "daily");
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching usage trends: " + e.getMessage()));
        }
    }


     //Get database statistics

    @GetMapping("/system/database-stats")
    public ResponseEntity<?> getDatabaseStatistics() {
        try {
            Object dbStats = adminService.getDatabaseStatistics();
            return ResponseEntity.ok(dbStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching database statistics: " + e.getMessage()));
        }
    }


     //Backup database (trigger backup process)

    @PostMapping("/system/backup")
    public ResponseEntity<?> triggerBackup(@RequestParam(required = false) String backupType) {
        try {
            String backupResult = adminService.triggerDatabaseBackup(backupType != null ? backupType : "FULL");
            return ResponseEntity.ok(new MessageResponse("Backup initiated successfully: " + backupResult));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error initiating backup: " + e.getMessage()));
        }
    }


     //Helper method to convert User entity to UserManagementResponse DTO

    private UserManagementResponse convertToUserResponse(User user) {
        return new UserManagementResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toSet()),
                true, // Assuming active status - you might want to add this field to User entity
                user.getCreatedAt() != null ? java.time.Instant.ofEpochMilli(user.getCreatedAt()).toString() : null,
                user.getUpdatedAt() != null ? java.time.Instant.ofEpochMilli(user.getUpdatedAt()).toString() : null
        );
    }
}