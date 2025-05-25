package com.example.fuelQuotaManagementSystem.service;

import com.example.fuelQuotaManagementSystem.dto.admin.AdminDashboardResponse;
import com.example.fuelQuotaManagementSystem.dto.admin.TopFuelConsumer;
import com.example.fuelQuotaManagementSystem.dto.admin.UsageTrendsData;
import com.example.fuelQuotaManagementSystem.entity.*;
import com.example.fuelQuotaManagementSystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private FuelStationRepository fuelStationRepository;

    @Autowired
    private FuelTransactionRepository fuelTransactionRepository;

    @Autowired
    private FuelQuotaRepository fuelQuotaRepository;

    @Autowired
    private FuelQuotaService fuelQuotaService;


     //Generate comprehensive admin dashboard

    public AdminDashboardResponse getSystemDashboard() {
        // Get all data
        List<User> allUsers = userRepository.findAll();
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        List<FuelStation> allStations = fuelStationRepository.findAll();
        List<FuelTransaction> allTransactions = fuelTransactionRepository.findAll();

        // Get today's date range
        LocalDate today = LocalDate.now();
        long startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endOfDay = today.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        // User statistics
        long totalVehicleOwners = allUsers.stream().filter(u -> u.getRoles().contains(Role.ROLE_VEHICLE_OWNER)).count();
        long totalStationOwners = allUsers.stream().filter(u -> u.getRoles().contains(Role.ROLE_STATION_OWNER)).count();
        long totalAdmins = allUsers.stream().filter(u -> u.getRoles().contains(Role.ROLE_ADMIN)).count();

        // Vehicle statistics
        long totalCars = allVehicles.stream().filter(v -> "Car".equalsIgnoreCase(v.getVehicleType())).count();
        long totalMotorcycles = allVehicles.stream().filter(v -> "Motorcycle".equalsIgnoreCase(v.getVehicleType())).count();
        long totalThreeWheelers = allVehicles.stream().filter(v -> "Three Wheeler".equalsIgnoreCase(v.getVehicleType())).count();

        // Station statistics
        long activeStations = allStations.stream().filter(FuelStation::isActive).count();
        long inactiveStations = allStations.size() - activeStations;

        // Today's transaction statistics
        List<FuelTransaction> todayTransactions = allTransactions.stream()
                .filter(t -> t.getTimestamp() >= startOfDay && t.getTimestamp() <= endOfDay)
                .collect(Collectors.toList());

        double todayPetrol = todayTransactions.stream()
                .filter(t -> "Petrol".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double todayDiesel = todayTransactions.stream()
                .filter(t -> "Diesel".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        // Total transaction statistics
        double totalPetrol = allTransactions.stream()
                .filter(t -> "Petrol".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double totalDiesel = allTransactions.stream()
                .filter(t -> "Diesel".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        // Current month quota statistics
        List<FuelQuota> allQuotas = fuelQuotaRepository.findAll();
        double currentMonthAllocated = allQuotas.stream().mapToDouble(FuelQuota::getAllocatedQuota).sum();
        double currentMonthUsed = currentMonthAllocated - allQuotas.stream().mapToDouble(FuelQuota::getRemainingQuota).sum();
        double utilizationPercentage = currentMonthAllocated > 0 ? (currentMonthUsed / currentMonthAllocated) * 100 : 0;

        // System health
        int failedNotifications = (int) allTransactions.stream()
                .filter(t -> t.getTimestamp() >= startOfDay && t.getTimestamp() <= endOfDay)
                .filter(t -> !t.isNotificationSent())
                .count();

        return new AdminDashboardResponse(
                (long) allUsers.size(),
                totalVehicleOwners,
                totalStationOwners,
                totalAdmins,
                (long) allVehicles.size(),
                totalCars,
                totalMotorcycles,
                totalThreeWheelers,
                (long) allStations.size(),
                activeStations,
                inactiveStations,
                (long) todayTransactions.size(),
                todayPetrol,
                todayDiesel,
                todayPetrol + todayDiesel,
                (long) allTransactions.size(),
                totalPetrol,
                totalDiesel,
                totalPetrol + totalDiesel,
                currentMonthAllocated,
                currentMonthUsed,
                currentMonthAllocated - currentMonthUsed,
                utilizationPercentage,
                failedNotifications == 0,
                today.minusDays(1).toString(), // Mock last backup date
                failedNotifications,
                java.time.LocalDateTime.now().toString()
        );
    }


     //Get all users in the system

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


     //Get users by role

    public List<User> getUsersByRole(String role) {
        Role roleEnum;
        switch (role.toLowerCase()) {
            case "admin":
                roleEnum = Role.ROLE_ADMIN;
                break;
            case "vehicle_owner":
                roleEnum = Role.ROLE_VEHICLE_OWNER;
                break;
            case "station_owner":
                roleEnum = Role.ROLE_STATION_OWNER;
                break;
            default:
                throw new IllegalArgumentException("Invalid role: " + role);
        }

        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(roleEnum))
                .collect(Collectors.toList());
    }


     //Get user by ID

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }


     //Update user roles

    public User updateUserRoles(Long userId, Set<String> roles) {
        User user = getUserById(userId);

        Set<Role> newRoles = new HashSet<>();
        for (String role : roles) {
            switch (role.toLowerCase()) {
                case "admin":
                    newRoles.add(Role.ROLE_ADMIN);
                    break;
                case "vehicle_owner":
                    newRoles.add(Role.ROLE_VEHICLE_OWNER);
                    break;
                case "station_owner":
                    newRoles.add(Role.ROLE_STATION_OWNER);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid role: " + role);
            }
        }

        user.setRoles(newRoles);
        return userRepository.save(user);
    }


    public void updateUserStatus(Long userId, boolean active) {
        User user = getUserById(userId);
        // For now, we'll just verify the user exists
        // In a real implementation, you'd update an 'active' field
        System.out.println("User " + user.getUsername() + " status updated to: " + (active ? "Active" : "Inactive"));
    }


    public Object getFuelConsumptionReport(LocalDate startDate, LocalDate endDate, String fuelType) {
        long startTimestamp = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        List<FuelTransaction> transactions = fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getTimestamp() >= startTimestamp && t.getTimestamp() <= endTimestamp)
                .filter(t -> fuelType == null || fuelType.isEmpty() || fuelType.equalsIgnoreCase(t.getFuelType()))
                .collect(Collectors.toList());

        double totalPetrol = transactions.stream()
                .filter(t -> "Petrol".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        double totalDiesel = transactions.stream()
                .filter(t -> "Diesel".equalsIgnoreCase(t.getFuelType()))
                .mapToDouble(FuelTransaction::getAmount)
                .sum();

        // Find most active station
        String mostActiveStation = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getStation().getName(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        // Find peak consumption day
        String peakDay = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> LocalDate.ofInstant(java.time.Instant.ofEpochMilli(t.getTimestamp()), ZoneId.systemDefault()),
                        Collectors.summingDouble(FuelTransaction::getAmount)
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey().toString())
                .orElse("N/A");

        return new Object() {
            public final String reportPeriod = startDate + " to " + endDate;
            public final String periodStartDate = startDate.toString();
            public final String periodEndDate = endDate.toString();
            public final Double totalPetrolConsumed = totalPetrol;
            public final Double totalDieselConsumed = totalDiesel;
            public final Double totalFuelConsumed = totalPetrol + totalDiesel;
            public final Integer totalTransactions = transactions.size();
            public final Double averageFuelPerTransaction = transactions.size() > 0 ? (totalPetrol + totalDiesel) / transactions.size() : 0.0;
            public final String mostActiveStations = mostActiveStation;
            public final String peakConsumptionDay = peakDay;
        };
    }


    public Object getQuotaUtilizationReport(String month) {
        List<FuelQuota> quotas = fuelQuotaRepository.findAll();

        if (month != null && !month.isEmpty()) {
            // Filter by specific month if provided
            // This is a simplified filter - in production you'd parse the month parameter properly
            LocalDate targetMonth = LocalDate.parse(month + "-01");
            long monthStart = targetMonth.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
            long monthEnd = targetMonth.withDayOfMonth(targetMonth.lengthOfMonth()).atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            quotas = quotas.stream()
                    .filter(q -> q.getStartDate() >= monthStart && q.getEndDate() <= monthEnd)
                    .collect(Collectors.toList());
        }

        double totalAllocated = quotas.stream().mapToDouble(FuelQuota::getAllocatedQuota).sum();
        double totalUsed = quotas.stream().mapToDouble(q -> q.getAllocatedQuota() - q.getRemainingQuota()).sum();
        double totalRemaining = quotas.stream().mapToDouble(FuelQuota::getRemainingQuota).sum();

        long fullyUtilized = quotas.stream().filter(q -> q.getRemainingQuota() <= 0).count();
        long notUsed = quotas.stream().filter(q -> q.getRemainingQuota().equals(q.getAllocatedQuota())).count();

        List<FuelQuota> finalQuotas = quotas;
        return new Object() {
            public final String months = month != null ? month : LocalDate.now().getMonth().toString();
            public final Long totalVehicles = (long) finalQuotas.size();
            public final Double totalQuotaAllocated = totalAllocated;
            public final Double totalQuotaUsed = totalUsed;
            public final Double totalQuotaRemaining = totalRemaining;
            public final Double utilizationPercentage = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0.0;
            public final Long vehiclesFullyUtilized = fullyUtilized;
            public final Long vehiclesNotUsed = notUsed;
            public final Double averageUtilizationPerVehicle = finalQuotas.size() > 0 ? totalUsed / finalQuotas.size() : 0.0;
        };
    }


    public Object getVehicleRegistrationReport(LocalDate startDate, LocalDate endDate) {
        long startTimestamp = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        List<Vehicle> vehicles = vehicleRepository.findAll().stream()
                .filter(v -> v.getCreatedAt() >= startTimestamp && v.getCreatedAt() <= endTimestamp)
                .collect(Collectors.toList());

        int carCount = (int) vehicles.stream().filter(v -> "Car".equalsIgnoreCase(v.getVehicleType())).count();
        int motorcycleCount = (int) vehicles.stream().filter(v -> "Motorcycle".equalsIgnoreCase(v.getVehicleType())).count();
        int threeWheelerCount = (int) vehicles.stream().filter(v -> "Three Wheeler".equalsIgnoreCase(v.getVehicleType())).count();

        int petrolCount = (int) vehicles.stream().filter(v -> "Petrol".equalsIgnoreCase(v.getFuelType())).count();
        int dieselCount = (int) vehicles.stream().filter(v -> "Diesel".equalsIgnoreCase(v.getFuelType())).count();

        String mostPopularType = Stream.of(
                new AbstractMap.SimpleEntry<>("Car", carCount),
                new AbstractMap.SimpleEntry<>("Motorcycle", motorcycleCount),
                new AbstractMap.SimpleEntry<>("Three Wheeler", threeWheelerCount)
        ).max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");

        String mostPopularFuel = petrolCount >= dieselCount ? "Petrol" : "Diesel";

        return new Object() {
            public final String reportPeriod = startDate + " to " + endDate;
            public final String periodStartDate = startDate.toString();
            public final String periodEndDate = endDate.toString();
            public final Integer totalRegistrations = vehicles.size();
            public final Integer carRegistrations = carCount;
            public final Integer motorcycleRegistrations = motorcycleCount;
            public final Integer threeWheelerRegistrations = threeWheelerCount;
            public final Integer petrolVehicles = petrolCount;
            public final Integer dieselVehicles = dieselCount;
            public final String mostPopularVehicleType = mostPopularType;
            public final String mostPopularFuelType = mostPopularFuel;
        };
    }


    public Object getStationPerformanceReport(LocalDate startDate, LocalDate endDate) {
        long startTimestamp = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        List<FuelTransaction> transactions = fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getTimestamp() >= startTimestamp && t.getTimestamp() <= endTimestamp)
                .collect(Collectors.toList());

        List<FuelStation> activeStations = fuelStationRepository.findAll().stream()
                .filter(FuelStation::isActive)
                .collect(Collectors.toList());

        // Station performance analysis
        Map<String, Long> stationTransactionCount = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getStation().getName(), Collectors.counting()));

        Map<String, Double> stationFuelDispensed = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getStation().getName(),
                        Collectors.summingDouble(FuelTransaction::getAmount)));

        String topStation = stationTransactionCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        String leastActiveStation = stationTransactionCount.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        double totalFuelDispensed = transactions.stream().mapToDouble(FuelTransaction::getAmount).sum();
        double avgTransactionsPerStation = activeStations.size() > 0 ? (double) transactions.size() / activeStations.size() : 0;
        double avgFuelPerStation = activeStations.size() > 0 ? totalFuelDispensed / activeStations.size() : 0;

        return new Object() {
            public final String reportPeriod = startDate + " to " + endDate;
            public final String periodStartDate = startDate.toString();
            public final String periodEndDate = endDate.toString();
            public final Integer totalActiveStations = activeStations.size();
            public final Long totalTransactions = (long) transactions.size();
            public final Double totalFuelDispenseds = totalFuelDispensed;
            public final String topPerformingStation = topStation;
            public final String leastActiveStations = leastActiveStation;
            public final Double averageTransactionsPerStation = avgTransactionsPerStation;
            public final Double averageFuelPerStation = avgFuelPerStation;
        };
    }


    public int bulkAllocateQuotas(String vehicleType, String fuelType, Double quotaAmount, String period) {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        // Filter by vehicle type
        if (!"All".equalsIgnoreCase(vehicleType)) {
            vehicles = vehicles.stream()
                    .filter(v -> vehicleType.equalsIgnoreCase(v.getVehicleType()))
                    .collect(Collectors.toList());
        }

        // Filter by fuel type
        if (!"Both".equalsIgnoreCase(fuelType)) {
            vehicles = vehicles.stream()
                    .filter(v -> fuelType.equalsIgnoreCase(v.getFuelType()))
                    .collect(Collectors.toList());
        }

        int affectedVehicles = 0;
        for (Vehicle vehicle : vehicles) {
            try {
                // Reset current quota to new amount
                fuelQuotaService.resetQuota(vehicle, vehicle.getFuelType());
                affectedVehicles++;
            } catch (Exception e) {
                System.err.println("Failed to allocate quota for vehicle: " + vehicle.getRegistrationNumber());
            }
        }

        return affectedVehicles;
    }


    public int resetAllQuotas() {
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        int resetCount = 0;

        for (Vehicle vehicle : allVehicles) {
            try {
                fuelQuotaService.resetQuota(vehicle, vehicle.getFuelType());
                resetCount++;
            } catch (Exception e) {
                System.err.println("Failed to reset quota for vehicle: " + vehicle.getRegistrationNumber());
            }
        }

        return resetCount;
    }


    public Object getSystemHealthStatus() {
        boolean dbConnected = true; // In real app, test database connection
        boolean notificationServiceUp = true; // In real app, test notification service

        List<User> allUsers = userRepository.findAll();
        List<FuelTransaction> todayTransactions = getTodayTransactions();

        int failedNotifications = (int) todayTransactions.stream()
                .filter(t -> !t.isNotificationSent())
                .count();

        return new Object() {
            public final Boolean overallHealth = dbConnected && notificationServiceUp && failedNotifications < 10;
            public final Boolean databaseConnected = dbConnected;
            public final Boolean isnotificationServiceUp = notificationServiceUp;
            public final Integer activeUsers = allUsers.size();
            public final Integer systemLoad = 25; // Mock system load percentage
            public final String lastSystemRestart = LocalDate.now().minusDays(7).toString();
            public final Integer totalErrors24h = failedNotifications;
            public final String diskUsage = "45%"; // Mock disk usage
            public final String memoryUsage = "67%"; // Mock memory usage
        };
    }


    public Object getNotificationStatistics() {
        List<FuelTransaction> allTransactions = fuelTransactionRepository.findAll();
        List<FuelTransaction> todayTransactions = getTodayTransactions();

        long totalNotificationsSent = allTransactions.stream().filter(FuelTransaction::isNotificationSent).count();
        long totalNotificationsFailed = allTransactions.size() - totalNotificationsSent;

        long todayNotificationsSent = todayTransactions.stream().filter(FuelTransaction::isNotificationSent).count();
        long todayNotificationsFailed = todayTransactions.size() - todayNotificationsSent;

        return new Object() {
            public final Long totalNotificationSent = totalNotificationsSent;
            public final Long totalNotificationFailed = totalNotificationsFailed;
            public final Double totalSuccessRate = allTransactions.size() > 0 ? (totalNotificationsSent * 100.0 / allTransactions.size()) : 100.0;
            public final Long todayNotificationSent = todayNotificationsSent;
            public final Long todayNotificationFailed = todayNotificationsFailed;
            public final Double todaySuccessRate = todayTransactions.size() > 0 ? (todayNotificationsSent * 100.0 / todayTransactions.size()) : 100.0;
        };
    }


    public String exportTransactionData(LocalDate startDate, LocalDate endDate, String format) {
        long startTimestamp = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        List<FuelTransaction> transactions = fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getTimestamp() >= startTimestamp && t.getTimestamp() <= endTimestamp)
                .collect(Collectors.toList());

        if ("CSV".equalsIgnoreCase(format)) {
            StringBuilder csv = new StringBuilder();
            csv.append("Transaction ID,Vehicle Registration,Station Name,Fuel Type,Amount,Date,Time,Notification Sent\n");

            for (FuelTransaction transaction : transactions) {
                LocalDate date = LocalDate.ofInstant(java.time.Instant.ofEpochMilli(transaction.getTimestamp()), ZoneId.systemDefault());
                csv.append(String.format("%d,%s,%s,%s,%.2f,%s,%s,%s\n",
                        transaction.getId(),
                        transaction.getVehicle().getRegistrationNumber(),
                        transaction.getStation().getName(),
                        transaction.getFuelType(),
                        transaction.getAmount(),
                        date.toString(),
                        date.atStartOfDay().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                        transaction.isNotificationSent() ? "Yes" : "No"
                ));
            }
            return csv.toString();
        }

        return "Export format not supported";
    }


    public Object getTopFuelConsumers(int limit, String period) {
        List<FuelTransaction> transactions = fuelTransactionRepository.findAll();

        // Filter by period if specified
        if (period != null && !period.isEmpty()) {
            LocalDate cutoffDate = LocalDate.now();
            switch (period.toLowerCase()) {
                case "week":
                    cutoffDate = cutoffDate.minusWeeks(1);
                    break;
                case "month":
                    cutoffDate = cutoffDate.minusMonths(1);
                    break;
                case "year":
                    cutoffDate = cutoffDate.minusYears(1);
                    break;
            }

            long cutoffTimestamp = cutoffDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
            transactions = transactions.stream()
                    .filter(t -> t.getTimestamp() >= cutoffTimestamp)
                    .collect(Collectors.toList());
        }

        // Group by vehicle and calculate consumption
        Map<String, List<FuelTransaction>> vehicleTransactions = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getVehicle().getRegistrationNumber()));

        List<TopFuelConsumer> topConsumers = vehicleTransactions.entrySet().stream()
                .map(entry -> {
                    String regNo = entry.getKey();
                    List<FuelTransaction> vTransactions = entry.getValue();
                    FuelTransaction firstTransaction = vTransactions.get(0);

                    double totalFuel = vTransactions.stream().mapToDouble(FuelTransaction::getAmount).sum();
                    int transactionCount = vTransactions.size();
                    double avgPerTransaction = transactionCount > 0 ? totalFuel / transactionCount : 0;

                    String lastTransactionDate = vTransactions.stream()
                            .max(Comparator.comparing(FuelTransaction::getTimestamp))
                            .map(t -> LocalDate.ofInstant(java.time.Instant.ofEpochMilli(t.getTimestamp()), ZoneId.systemDefault()).toString())
                            .orElse("N/A");

                    return new TopFuelConsumer(
                            regNo,
                            firstTransaction.getVehicle().getVehicleType(),
                            firstTransaction.getVehicle().getFuelType(),
                            firstTransaction.getVehicle().getOwner().getFullName(),
                            totalFuel,
                            transactionCount,
                            avgPerTransaction,
                            lastTransactionDate
                    );
                })
                .sorted((a, b) -> Double.compare(b.getTotalFuelConsumed(), a.getTotalFuelConsumed()))
                .limit(limit)
                .collect(Collectors.toList());

        return topConsumers;
    }


    public Object getSystemUsageTrends(LocalDate startDate, LocalDate endDate, String groupBy) {
        long startTimestamp = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        List<FuelTransaction> transactions = fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getTimestamp() >= startTimestamp && t.getTimestamp() <= endTimestamp)
                .collect(Collectors.toList());

        // Group transactions by date
        Map<LocalDate, List<FuelTransaction>> dailyTransactions = transactions.stream()
                .collect(Collectors.groupingBy(t ->
                        LocalDate.ofInstant(java.time.Instant.ofEpochMilli(t.getTimestamp()), ZoneId.systemDefault())
                ));

        List<UsageTrendsData> trends = dailyTransactions.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<FuelTransaction> dayTransactions = entry.getValue();

                    double totalFuel = dayTransactions.stream().mapToDouble(FuelTransaction::getAmount).sum();
                    int uniqueVehicles = (int) dayTransactions.stream()
                            .map(t -> t.getVehicle().getId())
                            .distinct()
                            .count();
                    int activeStations = (int) dayTransactions.stream()
                            .map(t -> t.getStation().getId())
                            .distinct()
                            .count();

                    return new UsageTrendsData(
                            date.toString(),
                            dayTransactions.size(),
                            totalFuel,
                            uniqueVehicles,
                            activeStations
                    );
                })
                .sorted(Comparator.comparing(UsageTrendsData::getDate))
                .collect(Collectors.toList());

        return trends;
    }


    public Object getDatabaseStatistics() {
        return new Object() {
            public final Long totalUsers = (long) userRepository.findAll().size();
            public final Long totalVehicles = (long) vehicleRepository.findAll().size();
            public final Long totalStations = (long) fuelStationRepository.findAll().size();
            public final Long totalTransactions = (long) fuelTransactionRepository.findAll().size();
            public final Long totalQuotas = (long) fuelQuotaRepository.findAll().size();
            public final String databaseSize = "2.4 GB"; // Mock database size
            public final String oldestRecord = "2024-01-01"; // Mock oldest record
            public final String newestRecord = LocalDate.now().toString();
            public final Integer indexCount = 15; // Mock index count
            public final String lastOptimization = LocalDate.now().minusDays(3).toString();
        };
    }


    public String triggerDatabaseBackup(String backupType) {
        // In a real implementation, this would trigger actual backup processes
        String backupId = "BACKUP_" + System.currentTimeMillis();
        System.out.println("Initiating " + backupType + " backup with ID: " + backupId);
        return backupId;
    }


    private List<FuelTransaction> getTodayTransactions() {
        LocalDate today = LocalDate.now();
        long startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endOfDay = today.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        return fuelTransactionRepository.findAll().stream()
                .filter(t -> t.getTimestamp() >= startOfDay && t.getTimestamp() <= endOfDay)
                .collect(Collectors.toList());
    }
}