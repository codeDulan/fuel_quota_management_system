package com.example.fuelQuotaManagementSystem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Fuel Pump Request DTO (for mobile app fuel pumping)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelPumpRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Station ID is required")
    private Long stationId;

    @NotBlank(message = "Fuel type is required")
    private String fuelType; // Petrol or Diesel

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1 liter")
    private Double amount; // Amount in liters
}