package com.example.fuelQuotaManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelQuotaResponse {
    private Long vehicleId;
    private String registrationNumber;
    private String vehicleType;
    private String fuelType;
    private Double engineCapacity;
    private String ownerName;
    private String ownerPhone;
    private Double allocatedQuota;
    private Double remainingQuota;
    private Double usedQuota;
    private Double usagePercentage;
    private Boolean expiringSoon;
    private String quotaStartDate;
    private String quotaEndDate;
}