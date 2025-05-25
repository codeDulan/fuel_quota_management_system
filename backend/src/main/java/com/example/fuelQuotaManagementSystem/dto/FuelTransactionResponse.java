package com.example.fuelQuotaManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelTransactionResponse {
    private Long id;
    private String vehicleRegistrationNumber;
    private String stationName;
    private String fuelType;
    private Double amount;
    private Double quotaBeforeTransaction;
    private Double quotaAfterTransaction;
    private Boolean notificationSent;
    private String timestamp;
}
