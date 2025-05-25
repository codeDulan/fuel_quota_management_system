package com.example.fuelQuotaManagementSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuickQuotaResponse {
    private String registrationNumber;
    private String fuelType;
    private Double remainingQuota;
    private Boolean canPump;
    private String message;
}