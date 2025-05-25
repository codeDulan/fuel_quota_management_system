package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseStatistics {
    private Long totalUsers;
    private Long totalVehicles;
    private Long totalStations;
    private Long totalTransactions;
    private Long totalQuotas;
    private String databaseSize;
    private String oldestRecord;
    private String newestRecord;
    private Integer indexCount;
    private String lastOptimization;
}