// Update your VehicleResponse DTO to include owner information
package com.example.fuelQuotaManagementSystem.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleResponse {
    private Long id;
    private String registrationNumber;
    private String vehicleType;
    private String fuelType;
    private Double engineCapacity;
    private String make;
    private String model;
    private Integer year;
    private String status;

    // Add owner information fields
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private Long createdAt;
    private Long updatedAt;

    // Constructor for backward compatibility (without owner info)
    public VehicleResponse(Long id, String registrationNumber, String vehicleType,
                           String fuelType, Double engineCapacity, String make,
                           String model, Integer year, String status) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.vehicleType = vehicleType;
        this.fuelType = fuelType;
        this.engineCapacity = engineCapacity;
        this.make = make;
        this.model = model;
        this.year = year;
        this.status = status;
    }
}