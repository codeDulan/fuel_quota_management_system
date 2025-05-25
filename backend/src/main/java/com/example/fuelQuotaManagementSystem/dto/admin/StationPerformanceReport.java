package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationPerformanceReport {
    private String reportPeriod;
    private String startDate;
    private String endDate;
    private Integer totalActiveStations;
    private Long totalTransactions;
    private Double totalFuelDispensed;
    private String topPerformingStation;
    private String leastActiveStation;
    private Double averageTransactionsPerStation;
    private Double averageFuelPerStation;
}