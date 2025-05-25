package com.example.fuelQuotaManagementSystem.dto.fuelStation;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationDashboardResponse {
    private Long stationId;
    private String stationName;
    private String registrationNumber;
    private String address;
    private String city;
    private Boolean isActive;

    // Today's statistics
    private Integer todayTransactionCount;
    private Double todayPetrolDispensed;
    private Double todayDieselDispensed;
    private Double todayTotalDispensed;

    // Total statistics
    private Integer totalTransactionCount;
    private Double totalFuelDispensed;
    private Double totalPetrolDispensed;
    private Double totalDieselDispensed;

    private String date;
}