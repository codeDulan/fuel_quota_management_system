package com.example.fuelQuotaManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DMTVehicleInfo {
    private String registrationNumber;
    private String chassisNumber;
    private String vehicleType;
    private String fuelType;
    private Double engineCapacity;
    private String make;
    private String model;
    private Integer year;
    private String registeredLocation;
    private String status;
}


