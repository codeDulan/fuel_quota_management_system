package com.example.fuelQuotaManagementSystem.repository;

import com.example.fuelQuotaManagementSystem.entity.FuelStation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FuelStationRepository extends JpaRepository<FuelStation, Long> {
    List<FuelStation> findByOwnerId(Long ownerId);
    Optional<FuelStation> findByRegistrationNumber(String registrationNumber);
}