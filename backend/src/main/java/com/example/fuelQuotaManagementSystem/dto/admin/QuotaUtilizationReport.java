package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotaUtilizationReport {
    private String month;
    private Long totalVehicles;
    private Double totalQuotaAllocated;
    private Double totalQuotaUsed;
    private Double totalQuotaRemaining;
    private Double utilizationPercentage;
    private Long vehiclesFullyUtilized;
    private Long vehiclesNotUsed;
    private Double averageUtilizationPerVehicle;
}