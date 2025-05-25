package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRegistrationReport {
    private String reportPeriod;
    private String startDate;
    private String endDate;
    private Integer totalRegistrations;
    private Integer carRegistrations;
    private Integer motorcycleRegistrations;
    private Integer threeWheelerRegistrations;
    private Integer petrolVehicles;
    private Integer dieselVehicles;
    private String mostPopularVehicleType;
    private String mostPopularFuelType;
}