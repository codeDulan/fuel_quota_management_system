package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageTrendsData {
    private String date;
    private Integer transactionCount;
    private Double fuelDispensed;
    private Integer uniqueVehicles;
    private Integer activeStations;
}