package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkQuotaAllocationRequest {
    private String vehicleType;
    private String fuelType;
    private Double quotaAmount;
    private String period;
    private String reason;
}