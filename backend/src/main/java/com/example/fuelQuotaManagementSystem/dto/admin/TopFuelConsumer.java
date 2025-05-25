package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopFuelConsumer {
    private String vehicleRegistrationNumber;
    private String vehicleType;
    private String fuelType;
    private String ownerName;
    private Double totalFuelConsumed;
    private Integer totalTransactions;
    private Double averageFuelPerTransaction;
    private String lastTransactionDate;
}