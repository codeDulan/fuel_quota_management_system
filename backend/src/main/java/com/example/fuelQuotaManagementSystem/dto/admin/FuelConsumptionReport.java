package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelConsumptionReport {
    private String reportPeriod;
    private String startDate;
    private String endDate;
    private Double totalPetrolConsumed;
    private Double totalDieselConsumed;
    private Double totalFuelConsumed;
    private Integer totalTransactions;
    private Double averageFuelPerTransaction;
    private String mostActiveStation;
    private String peakConsumptionDay;
}