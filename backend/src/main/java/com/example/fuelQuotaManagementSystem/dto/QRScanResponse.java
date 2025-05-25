package com.example.fuelQuotaManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRScanResponse {
    private Long vehicleId;
    private String registrationNumber;
    private String vehicleType;
    private String fuelType;
    private Double engineCapacity;
    private String make;
    private String model;
    private String ownerName;
    private String ownerPhone;
    private Double remainingQuota;
    private String quotaType;

}
