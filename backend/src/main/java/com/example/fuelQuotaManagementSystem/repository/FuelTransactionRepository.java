package com.example.fuelQuotaManagementSystem.repository;

import com.example.fuelQuotaManagementSystem.entity.FuelTransaction;
import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FuelTransactionRepository extends JpaRepository<FuelTransaction, Long> {
    List<FuelTransaction> findByVehicleOrderByTimestampDesc(Vehicle vehicle);
    List<FuelTransaction> findByVehicleIdOrderByTimestampDesc(Long vehicleId);

    List<FuelTransaction> findByStationIdOrderByTimestampDesc(Long stationId);
}