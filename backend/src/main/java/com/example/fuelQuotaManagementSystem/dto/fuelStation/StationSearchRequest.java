package com.example.fuelQuotaManagementSystem.dto.fuelStation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationSearchRequest {
    private String city;
    private String fuelType; // "Petrol", "Diesel", or "Both"
    private Boolean activeOnly = true;
}