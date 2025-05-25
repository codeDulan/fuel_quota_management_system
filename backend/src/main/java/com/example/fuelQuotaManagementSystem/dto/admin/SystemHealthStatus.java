package com.example.fuelQuotaManagementSystem.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthStatus {
    private Boolean overallHealth;
    private Boolean databaseConnected;
    private Boolean notificationServiceUp;
    private Integer activeUsers;
    private Integer systemLoad; // Percentage
    private String lastSystemRestart;
    private Integer totalErrors24h;
    private String diskUsage;
    private String memoryUsage;
}