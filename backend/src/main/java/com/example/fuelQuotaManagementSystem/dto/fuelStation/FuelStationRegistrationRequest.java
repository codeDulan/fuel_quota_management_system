package com.example.fuelQuotaManagementSystem.dto.fuelStation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Fuel Station Registration Request DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelStationRegistrationRequest {

    @NotBlank(message = "Station name is required")
    private String name;

    @NotBlank(message = "Registration number is required")
    @Pattern(regexp = "^SR-[A-Z]{3}-\\d{4}$",
            message = "Registration number must follow format: SR-XXX-0000 (e.g., SR-COL-0001)")
    private String registrationNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotNull(message = "Petrol availability status is required")
    private Boolean hasPetrol;

    @NotNull(message = "Diesel availability status is required")
    private Boolean hasDiesel;
}