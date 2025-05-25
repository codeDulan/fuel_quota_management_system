package com.example.fuelQuotaManagementSystem.service;

import com.example.fuelQuotaManagementSystem.dto.fuelStation.FuelStationRegistrationRequest;
import com.example.fuelQuotaManagementSystem.dto.fuelStation.StationDashboardResponse;
import com.example.fuelQuotaManagementSystem.entity.FuelStation;
import com.example.fuelQuotaManagementSystem.entity.FuelTransaction;
import com.example.fuelQuotaManagementSystem.entity.User;
import com.example.fuelQuotaManagementSystem.repository.FuelStationRepository;
import com.example.fuelQuotaManagementSystem.repository.FuelTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FuelStationService {

    @Autowired
    private FuelStationRepository fuelStationRepository;

    @Autowired
    private FuelTransactionRepository fuelTransactionRepository;


    public FuelStation registerStation(FuelStationRegistrationRequest request, User owner) {
        // Validate registration number format
        if (!isValidStationRegistrationNumber(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Invalid registration number format! Use format: SR-XXX-0000");
        }

        // Check if registration number already exists
        if (fuelStationRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
            throw new IllegalArgumentException("Station with this registration number already exists!");
        }

        // Validate fuel types - station must have at least one fuel type
        if (!request.getHasPetrol() && !request.getHasDiesel()) {
            throw new IllegalArgumentException("Station must have at least one fuel type available!");
        }

        // Create new fuel station
        FuelStation station = new FuelStation();
        station.setName(request.getName());
        station.setRegistrationNumber(request.getRegistrationNumber());
        station.setAddress(request.getAddress());
        station.setCity(request.getCity());
        station.setContactNumber(request.getContactNumber());
        station.setOwner(owner);
        station.setHasPetrol(request.getHasPetrol());
        station.setHasDiesel(request.getHasDiesel());
        station.setActive(true); // New stations are active by default

        return fuelStationRepository.save(station);
    }


    public List<FuelStation> getStationsByOwner(Long ownerId) {
        return fuelStationRepository.findByOwnerId(ownerId);
    }


    public List<FuelStation> getAllStations() {
        return fuelStationRepository.findAll();
    }


    public FuelStation getStationById(Long stationId, Long userId, boolean isAdmin) {
        Optional<FuelStation> stationOptional = fuelStationRepository.findById(stationId);

        if (!stationOptional.isPresent()) {
            throw new IllegalArgumentException("Fuel station not found!");
        }

        FuelStation station = stationOptional.get();

        // Check ownership (unless admin)
        if (!isAdmin && !station.getOwner().getId().equals(userId)) {
            throw new SecurityException("Access denied: You don't own this fuel station!");
        }

        return station;
    }


    public FuelStation updateStation(Long stationId, FuelStationRegistrationRequest request, Long userId, boolean isAdmin) {
        FuelStation station = getStationById(stationId, userId, isAdmin);

        // Validate fuel types - station must have at least one fuel type
        if (!request.getHasPetrol() && !request.getHasDiesel()) {
            throw new IllegalArgumentException("Station must have at least one fuel type available!");
        }

        // Update station details (registration number cannot be changed)
        station.setName(request.getName());
        station.setAddress(request.getAddress());
        station.setCity(request.getCity());
        station.setContactNumber(request.getContactNumber());
        station.setHasPetrol(request.getHasPetrol());
        station.setHasDiesel(request.getHasDiesel());

        return fuelStationRepository.save(station);
    }


    public FuelStation updateStationStatus(Long stationId, boolean active) {
        Optional<FuelStation> stationOptional = fuelStationRepository.findById(stationId);

        if (!stationOptional.isPresent()) {
            throw new IllegalArgumentException("Fuel station not found!");
        }

        FuelStation station = stationOptional.get();
        station.setActive(active);

        return fuelStationRepository.save(station);
    }


    public List<FuelStation> findNearbyStations(String city) {
        return fuelStationRepository.findAll().stream()
                .filter(station -> station.isActive() &&
                        (station.getCity().toLowerCase().contains(city.toLowerCase()) ||
                                station.getAddress().toLowerCase().contains(city.toLowerCase())))
                .collect(Collectors.toList());
    }


    public List<FuelStation> findStationsByFuelType(String city, String fuelType) {
        return findNearbyStations(city).stream()
                .filter(station -> {
                    if ("Petrol".equalsIgnoreCase(fuelType)) {
                        return station.isHasPetrol();
                    } else if ("Diesel".equalsIgnoreCase(fuelType)) {
                        return station.isHasDiesel();
                    } else {
                        return station.isHasPetrol() || station.isHasDiesel(); // Both or any
                    }
                })
                .collect(Collectors.toList());
    }


    public StationDashboardResponse getStationDashboard(Long stationId, Long userId, boolean isAdmin) {
        FuelStation station = getStationById(stationId, userId, isAdmin);

        // Get today's date range
        LocalDate today = LocalDate.now();
        long startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endOfDay = today.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        // Get all transactions for this station
        List<FuelTransaction> allStationTransactions = fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getStation().getId().equals(stationId))
                .collect(Collectors.toList());

        // Get today's transactions
        List<FuelTransaction> todayTransactions = allStationTransactions.stream()
                .filter(t -> t.getTimestamp() >= startOfDay && t.getTimestamp() <= endOfDay)
                .collect(Collectors.toList());

        // Calculate today's statistics
        double todayPetrolDispensed = todayTransactions.stream()
                .filter(t -> "Petrol".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double todayDieselDispensed = todayTransactions.stream()
                .filter(t -> "Diesel".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        // Calculate total statistics
        double totalFuelDispensed = allStationTransactions.stream()
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double totalPetrolDispensed = allStationTransactions.stream()
                .filter(t -> "Petrol".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double totalDieselDispensed = allStationTransactions.stream()
                .filter(t -> "Diesel".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        // Create dashboard response
        StationDashboardResponse dashboard = new StationDashboardResponse();
        dashboard.setStationId(station.getId());
        dashboard.setStationName(station.getName());
        dashboard.setRegistrationNumber(station.getRegistrationNumber());
        dashboard.setAddress(station.getAddress());
        dashboard.setCity(station.getCity());
        dashboard.setIsActive(station.isActive());

        // Today's statistics
        dashboard.setTodayTransactionCount(todayTransactions.size());
        dashboard.setTodayPetrolDispensed(todayPetrolDispensed);
        dashboard.setTodayDieselDispensed(todayDieselDispensed);
        dashboard.setTodayTotalDispensed(todayPetrolDispensed + todayDieselDispensed);

        // Total statistics
        dashboard.setTotalTransactionCount(allStationTransactions.size());
        dashboard.setTotalFuelDispensed(totalFuelDispensed);
        dashboard.setTotalPetrolDispensed(totalPetrolDispensed);
        dashboard.setTotalDieselDispensed(totalDieselDispensed);

        dashboard.setDate(today.toString());

        return dashboard;
    }


    public Object getStationStatistics(Long stationId, LocalDate startDate, LocalDate endDate, Long userId, boolean isAdmin) {
        FuelStation station = getStationById(stationId, userId, isAdmin);

        long startTimestamp = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        List<FuelTransaction> transactions = fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getStation().getId().equals(stationId) &&
                        t.getTimestamp() >= startTimestamp &&
                        t.getTimestamp() <= endTimestamp)
                .collect(Collectors.toList());

        // Calculate statistics
        double totalPetrol = transactions.stream()
                .filter(t -> "Petrol".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double totalDiesel = transactions.stream()
                .filter(t -> "Diesel".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        return new Object() {
            public final String stationName = station.getName();
            public final String registrationNumber = station.getRegistrationNumber();
            public final String periodStartDate  = startDate.toString();
            public final String periodEndDate  = endDate.toString();
            public final Integer transactionCount = transactions.size();
            public final Double totalPetrolDispensed = totalPetrol;
            public final Double totalDieselDispensed = totalDiesel;
            public final Double totalFuelDispensed = totalPetrol + totalDiesel;
        };
    }


    public boolean isStationActiveAndExists(Long stationId) {
        Optional<FuelStation> stationOptional = fuelStationRepository.findById(stationId);
        return stationOptional.isPresent() && stationOptional.get().isActive();
    }


    public boolean stationSupportsFuelType(Long stationId, String fuelType) {
        Optional<FuelStation> stationOptional = fuelStationRepository.findById(stationId);

        if (!stationOptional.isPresent()) {
            return false;
        }

        FuelStation station = stationOptional.get();

        if ("Petrol".equalsIgnoreCase(fuelType)) {
            return station.isHasPetrol();
        } else if ("Diesel".equalsIgnoreCase(fuelType)) {
            return station.isHasDiesel();
        }

        return false;
    }


    private boolean isValidStationRegistrationNumber(String regNumber) {
        // Sri Lankan fuel station format: SR-XXXX-YYYY (e.g., SR-COL-0001, SR-GAL-0005)
        return regNumber != null && regNumber.matches("^SR-[A-Z]{3}-\\d{4}$");
    }


    public Object getStationCountByCity() {
        List<FuelStation> allStations = fuelStationRepository.findAll();

        return allStations.stream()
                .collect(Collectors.groupingBy(
                        FuelStation::getCity,
                        Collectors.counting()
                ));
    }


    public Object getStationStatusSummary() {
        List<FuelStation> allStations = fuelStationRepository.findAll();

        long activeCount = allStations.stream().filter(FuelStation::isActive).count();
        long inactiveCount = allStations.size() - activeCount;

        return new Object() {
            public final Long totalStations = (long) allStations.size();
            public final Long activeStations = activeCount;
            public final Long inactiveStations = inactiveCount;
            public final Double activePercentage = allStations.size() > 0 ? (activeCount * 100.0 / allStations.size()) : 0.0;
        };
    }
}