package com.example.fuelQuotaManagementSystem.service;

import com.example.fuelQuotaManagementSystem.entity.FuelQuota;
import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import com.example.fuelQuotaManagementSystem.repository.FuelQuotaRepository;
import com.example.fuelQuotaManagementSystem.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

@Service
public class FuelQuotaService {

    @Autowired
    private FuelQuotaRepository fuelQuotaRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NotificationService notificationService;

    // Default monthly quota allocations (in liters)
    private static final double PETROL_CAR_QUOTA = 60.0;
    private static final double PETROL_MOTORCYCLE_QUOTA = 20.0;
    private static final double PETROL_THREE_WHEELER_QUOTA = 40.0;
    private static final double DIESEL_CAR_QUOTA = 80.0;
    private static final double DIESEL_COMMERCIAL_QUOTA = 200.0;

    // Low quota warning thresholds (percentage)
    private static final double LOW_QUOTA_THRESHOLD_PERCENTAGE = 20.0;
    private static final double CRITICAL_QUOTA_THRESHOLD_PERCENTAGE = 10.0;

    /**
     * AUTOMATIC QUOTA RESET - Runs on 1st of every month at 12:01 AM
     * FOR TESTING: Change to "0 * * * * ?" to run every minute
     * FOR PRODUCTION: Use "0 1 0 1 * ?" to run 1st of month at 12:01 AM
     */
//    @Scheduled(cron = "0 * * * * ?") //for testing
    @Scheduled(cron = "0 1 0 1 * ?") //for production
    public void automaticMonthlyQuotaReset() {
        LocalDate today = LocalDate.now();

        // FOR TESTING: Run every minute
        System.out.println("=== TESTING QUOTA RESET - " + java.time.LocalDateTime.now() + " ===");

        // FOR PRODUCTION: Only run on 1st of month
        // if (today.getDayOfMonth() != 1) {
        //     return; // Exit if not 1st day of month
        // }

        System.out.println("=== STARTING AUTOMATIC MONTHLY QUOTA RESET ===");
        System.out.println("Date: " + today);

        try {
            List<Vehicle> allVehicles = vehicleRepository.findAll();
            int successCount = 0;
            int failCount = 0;

            for (Vehicle vehicle : allVehicles) {
                try {
                    // Reset quota for this vehicle
                    automaticMonthlyReset(vehicle, vehicle.getFuelType());
                    successCount++;

                    System.out.println("Reset quota for: " + vehicle.getRegistrationNumber());

                } catch (Exception e) {
                    failCount++;
                    System.err.println("Failed to reset quota for: " + vehicle.getRegistrationNumber() +
                            " - Error: " + e.getMessage());
                }
            }

            System.out.println("=== AUTOMATIC RESET COMPLETED ===");
            System.out.println("Total vehicles: " + allVehicles.size());
            System.out.println("Successfully reset: " + successCount);
            System.out.println("Failed: " + failCount);

        } catch (Exception e) {
            System.err.println("ERROR in automatic quota reset: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Automatic monthly quota reset for a single vehicle
     */
    private FuelQuota automaticMonthlyReset(Vehicle vehicle, String fuelType) {
        try {
            // Get current month boundaries
            LocalDate now = LocalDate.now();
            LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

            long startTimestamp = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
            long endTimestamp = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            // Find and delete any existing quota
            Optional<FuelQuota> existingQuota = fuelQuotaRepository
                    .findByVehicleAndFuelTypeAndEndDateGreaterThanEqual(vehicle, fuelType, System.currentTimeMillis());

            if (existingQuota.isPresent()) {
                fuelQuotaRepository.delete(existingQuota.get());
                System.out.println("Deleted old quota for: " + vehicle.getRegistrationNumber());
            }

            // Create fresh quota for the new month
            FuelQuota newQuota = createNewMonthlyQuota(vehicle, fuelType, startTimestamp, endTimestamp);

            // ✅ SEND SMS TO VEHICLE OWNER ONLY (No admin SMS)
            try {
                boolean smsSuccess = notificationService.sendNewQuotaAllocationNotification(
                        vehicle.getOwner().getPhoneNumber(),
                        vehicle.getOwner().getEmail(),
                        vehicle.getRegistrationNumber(),
                        newQuota.getAllocatedQuota(),
                        now.getMonth().toString() + " " + now.getYear()
                );

                System.out.println("SMS sent to " + vehicle.getRegistrationNumber() + ": " + smsSuccess);

            } catch (Exception e) {
                System.err.println("Failed to send SMS to: " + vehicle.getRegistrationNumber());
            }

            return newQuota;

        } catch (Exception e) {
            System.err.println("Error in automatic reset for: " + vehicle.getRegistrationNumber());
            throw new RuntimeException("Automatic reset failed: " + e.getMessage());
        }
    }
    

    public FuelQuota getCurrentQuota(Vehicle vehicle, String fuelType) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        long startTimestamp = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        long endTimestamp = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        Optional<FuelQuota> existingQuota = fuelQuotaRepository
                .findByVehicleAndFuelTypeAndEndDateGreaterThanEqual(vehicle, fuelType, System.currentTimeMillis());

        if (existingQuota.isPresent()) {
            FuelQuota quota = existingQuota.get();
            if (quota.getStartDate() >= startTimestamp && quota.getStartDate() <= endTimestamp) {
                return quota;
            }
        }

        return createNewMonthlyQuota(vehicle, fuelType, startTimestamp, endTimestamp);
    }

    private FuelQuota createNewMonthlyQuota(Vehicle vehicle, String fuelType, long startDate, long endDate) {
        FuelQuota quota = new FuelQuota();
        quota.setVehicle(vehicle);
        quota.setFuelType(fuelType);
        quota.setAllocationPeriod("MONTHLY");
        quota.setStartDate(startDate);
        quota.setEndDate(endDate);

        double allocatedQuota = calculateQuotaAllocation(vehicle.getVehicleType(), fuelType, vehicle.getEngineCapacity());
        quota.setAllocatedQuota(allocatedQuota);
        quota.setRemainingQuota(allocatedQuota);

        return fuelQuotaRepository.save(quota);
    }

    private double calculateQuotaAllocation(String vehicleType, String fuelType, Double engineCapacity) {
        if ("Petrol".equalsIgnoreCase(fuelType)) {
            switch (vehicleType.toLowerCase()) {
                case "car":
                    if (engineCapacity != null && engineCapacity > 1800) {
                        return PETROL_CAR_QUOTA + 20.0;
                    }
                    return PETROL_CAR_QUOTA;
                case "motorcycle":
                    return PETROL_MOTORCYCLE_QUOTA;
                case "three wheeler":
                    return PETROL_THREE_WHEELER_QUOTA;
                default:
                    return PETROL_CAR_QUOTA;
            }
        } else if ("Diesel".equalsIgnoreCase(fuelType)) {
            switch (vehicleType.toLowerCase()) {
                case "car":
                    return DIESEL_CAR_QUOTA;
                case "bus":
                case "lorry":
                    return DIESEL_COMMERCIAL_QUOTA;
                default:
                    return DIESEL_CAR_QUOTA;
            }
        }
        return PETROL_CAR_QUOTA;
    }

    public boolean deductFuel(Vehicle vehicle, String fuelType, double amountLiters) {
        FuelQuota quota = getCurrentQuota(vehicle, fuelType);

        if (quota.getRemainingQuota() >= amountLiters) {
            double quotaBeforeDeduction = quota.getRemainingQuota();
            quota.setRemainingQuota(quota.getRemainingQuota() - amountLiters);
            fuelQuotaRepository.save(quota);

            checkAndSendLowQuotaWarning(vehicle, quota, quotaBeforeDeduction);
            return true;
        }
        return false;
    }

    private void checkAndSendLowQuotaWarning(Vehicle vehicle, FuelQuota quota, double quotaBeforeDeduction) {
        double remainingQuota = quota.getRemainingQuota();
        double allocatedQuota = quota.getAllocatedQuota();
        double remainingPercentage = (remainingQuota / allocatedQuota) * 100;
        double previousPercentage = (quotaBeforeDeduction / allocatedQuota) * 100;

        if (remainingPercentage <= CRITICAL_QUOTA_THRESHOLD_PERCENTAGE &&
                previousPercentage > CRITICAL_QUOTA_THRESHOLD_PERCENTAGE) {

            sendCriticalQuotaWarning(vehicle, remainingQuota, quota.getFuelType());
        }
        else if (remainingPercentage <= LOW_QUOTA_THRESHOLD_PERCENTAGE &&
                previousPercentage > LOW_QUOTA_THRESHOLD_PERCENTAGE) {

            sendLowQuotaWarning(vehicle, remainingQuota, quota.getFuelType());
        }
    }

    private boolean sendLowQuotaWarning(Vehicle vehicle, double remainingQuota, String fuelType) {
        try {
            return notificationService.sendLowQuotaWarning(
                    vehicle.getOwner().getPhoneNumber(),
                    vehicle.getOwner().getEmail(),
                    vehicle.getRegistrationNumber(),
                    remainingQuota,
                    fuelType,
                    LOW_QUOTA_THRESHOLD_PERCENTAGE
            );
        } catch (Exception e) {
            System.err.println("Failed to send low quota warning: " + e.getMessage());
            return false;
        }
    }

    private boolean sendCriticalQuotaWarning(Vehicle vehicle, double remainingQuota, String fuelType) {
        try {
            return notificationService.sendLowQuotaWarning(
                    vehicle.getOwner().getPhoneNumber(),
                    vehicle.getOwner().getEmail(),
                    vehicle.getRegistrationNumber(),
                    remainingQuota,
                    fuelType,
                    CRITICAL_QUOTA_THRESHOLD_PERCENTAGE
            );
        } catch (Exception e) {
            System.err.println("Failed to send critical quota warning: " + e.getMessage());
            return false;
        }
    }

    public boolean hasSufficientQuota(Vehicle vehicle, String fuelType, double requestedAmount) {
        FuelQuota quota = getCurrentQuota(vehicle, fuelType);
        return quota.getRemainingQuota() >= requestedAmount;
    }

    public double getRemainingQuota(Vehicle vehicle, String fuelType) {
        FuelQuota quota = getCurrentQuota(vehicle, fuelType);
        return quota.getRemainingQuota();
    }

    public FuelQuotaInfo getQuotaInfo(Vehicle vehicle, String fuelType) {
        FuelQuota quota = getCurrentQuota(vehicle, fuelType);

        return new FuelQuotaInfo(
                quota.getId(),
                quota.getAllocatedQuota(),
                quota.getRemainingQuota(),
                quota.getAllocatedQuota() - quota.getRemainingQuota(),
                quota.getStartDate(),
                quota.getEndDate(),
                isQuotaExpiringSoon(quota),
                getQuotaUsagePercentage(quota)
        );
    }

    public FuelQuota resetQuota(Vehicle vehicle, String fuelType) {
        try {
            Optional<FuelQuota> existingQuota = fuelQuotaRepository
                    .findByVehicleAndFuelTypeAndEndDateGreaterThanEqual(vehicle, fuelType, System.currentTimeMillis());

            if (existingQuota.isPresent()) {
                fuelQuotaRepository.delete(existingQuota.get());
            }

            LocalDate now = LocalDate.now();
            LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

            long startTimestamp = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
            long endTimestamp = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

            FuelQuota newQuota = createNewMonthlyQuota(vehicle, fuelType, startTimestamp, endTimestamp);

            try {
                notificationService.sendNewQuotaAllocationNotification(
                        vehicle.getOwner().getPhoneNumber(),
                        vehicle.getOwner().getEmail(),
                        vehicle.getRegistrationNumber(),
                        newQuota.getAllocatedQuota(),
                        now.getMonth().toString() + " " + now.getYear()
                );
            } catch (Exception e) {
                System.err.println("Failed to send quota reset SMS: " + e.getMessage());
            }

            return newQuota;

        } catch (Exception e) {
            throw new RuntimeException("Failed to reset quota: " + e.getMessage());
        }
    }

    private boolean isQuotaExpiringSoon(FuelQuota quota) {
        long threeDaysInMillis = 3 * 24 * 60 * 60 * 1000L;
        long currentTime = System.currentTimeMillis();
        return (quota.getEndDate() - currentTime) <= threeDaysInMillis;
    }

    private double getQuotaUsagePercentage(FuelQuota quota) {
        if (quota.getAllocatedQuota() == 0) return 0;
        double usedQuota = quota.getAllocatedQuota() - quota.getRemainingQuota();
        return (usedQuota / quota.getAllocatedQuota()) * 100;
    }

    public static class FuelQuotaInfo {
        private Long quotaId;
        private double allocatedQuota;
        private double remainingQuota;
        private double usedQuota;
        private long startDate;
        private long endDate;
        private boolean expiringSoon;
        private double usagePercentage;

        public FuelQuotaInfo(Long quotaId, double allocatedQuota, double remainingQuota,
                             double usedQuota, long startDate, long endDate,
                             boolean expiringSoon, double usagePercentage) {
            this.quotaId = quotaId;
            this.allocatedQuota = allocatedQuota;
            this.remainingQuota = remainingQuota;
            this.usedQuota = usedQuota;
            this.startDate = startDate;
            this.endDate = endDate;
            this.expiringSoon = expiringSoon;
            this.usagePercentage = usagePercentage;
        }

        // Getters
        public Long getQuotaId() { return quotaId; }
        public double getAllocatedQuota() { return allocatedQuota; }
        public double getRemainingQuota() { return remainingQuota; }
        public double getUsedQuota() { return usedQuota; }
        public long getStartDate() { return startDate; }
        public long getEndDate() { return endDate; }
        public boolean isExpiringSoon() { return expiringSoon; }
        public double getUsagePercentage() { return usagePercentage; }
    }
}