package com.example.fuelQuotaManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelStationSummary {
    private Long stationId;
    private String stationName;
    private String address;
    private Boolean hasPetrol;
    private Boolean hasDiesel;
    private Boolean isActive;
    private Integer todayTransactions;
    private Double todayFuelDispensed;
}
