package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

// Admin Dashboard Response DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // User Statistics
    private Long totalUsers;
    private Long totalVehicleOwners;
    private Long totalStationOwners;
    private Long totalAdmins;

    // Vehicle Statistics
    private Long totalVehicles;
    private Long totalCars;
    private Long totalMotorcycles;
    private Long totalThreeWheelers;

    // Station Statistics
    private Long totalStations;
    private Long activeStations;
    private Long inactiveStations;

    // Transaction Statistics (Today)
    private Long todayTransactions;
    private Double todayPetrolDispensed;
    private Double todayDieselDispensed;
    private Double todayTotalFuelDispensed;

    // Transaction Statistics (Total)
    private Long totalTransactions;
    private Double totalPetrolDispensed;
    private Double totalDieselDispensed;
    private Double totalFuelDispensed;

    // Quota Statistics (Current Month)
    private Double currentMonthQuotaAllocated;
    private Double currentMonthQuotaUsed;
    private Double currentMonthQuotaRemaining;
    private Double quotaUtilizationPercentage;

    // System Health
    private Boolean systemHealthy;
    private String lastBackupDate;
    private Integer failedNotificationsToday;

    private String generatedAt;
}