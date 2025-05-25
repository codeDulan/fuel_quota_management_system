package com.example.fuelQuotaManagementSystem.dto.fuelStation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelStationResponse {
    private Long id;
    private String name;
    private String registrationNumber;
    private String address;
    private String city;
    private String contactNumber;
    private String ownerName;
    private String ownerEmail;
    private Boolean hasPetrol;
    private Boolean hasDiesel;
    private Boolean isActive;
    private String status;
}