package com.example.fuelQuotaManagementSystem.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "fuel_quotas")
@Data
public class FuelQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String fuelType;

    @Column(nullable = false)
    private Double allocatedQuota;

    @Column(nullable = false)
    private Double remainingQuota;

    // Weekly or monthly allocation period
    private String allocationPeriod;

    // Start and end date for this quota period
    private Long startDate;
    private Long endDate;

    // Timestamps
    private Long createdAt;
    private Long updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = System.currentTimeMillis();
    }
}