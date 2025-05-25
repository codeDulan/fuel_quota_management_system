package com.example.fuelQuotaManagementSystem.repository;

import com.example.fuelQuotaManagementSystem.entity.FuelQuota;
import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FuelQuotaRepository extends JpaRepository<FuelQuota, Long> {
    Optional<FuelQuota> findByVehicleAndFuelTypeAndEndDateGreaterThanEqual(Vehicle vehicle, String fuelType, Long currentDate);
}