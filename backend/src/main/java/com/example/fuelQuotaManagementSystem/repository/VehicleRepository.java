package com.example.fuelQuotaManagementSystem.repository;

import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    List<Vehicle> findByOwnerId(Long ownerId);
    boolean existsByRegistrationNumber(String registrationNumber);
}