package com.example.fuelQuotaManagementSystem.entity;

import com.example.fuelQuotaManagementSystem.entity.FuelStation;
import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "fuel_transactions")
@Data
public class FuelTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private FuelStation station;

    @Column(nullable = false)
    private String fuelType;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double quotaBeforeTransaction;

    @Column(nullable = false)
    private Double quotaAfterTransaction;

    // Notification status
    private boolean notificationSent;

    // Timestamps
    private Long timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = System.currentTimeMillis();
    }


}