package com.example.fuelQuotaManagementSystem.config;

import com.example.fuelQuotaManagementSystem.entity.User;
import com.example.fuelQuotaManagementSystem.entity.Role;
import com.example.fuelQuotaManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    public CommandLineRunner initializeDatabase() {
        return args -> {
            // Create default users if they don't exist
            if (userRepository.count() == 0) {
                createDefaultUsers();
            }
        };
    }
    
    private void createDefaultUsers() {
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setFullName("System Administrator");
        admin.setPhoneNumber("1234567890");
        
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ROLE_ADMIN);
        admin.setRoles(adminRoles);
        userRepository.save(admin);
        
        // Create station owner user
        User stationOwner = new User();
        stationOwner.setUsername("station");
        stationOwner.setEmail("station@example.com");
        stationOwner.setPassword(passwordEncoder.encode("password"));
        stationOwner.setFullName("Station Owner");
        stationOwner.setPhoneNumber("2345678901");
        
        Set<Role> stationRoles = new HashSet<>();
        stationRoles.add(Role.ROLE_STATION_OWNER);
        stationOwner.setRoles(stationRoles);
        userRepository.save(stationOwner);
        
        // Create vehicle owner user
        User vehicleOwner = new User();
        vehicleOwner.setUsername("vehicle");
        vehicleOwner.setEmail("vehicle@example.com");
        vehicleOwner.setPassword(passwordEncoder.encode("password"));
        vehicleOwner.setFullName("Vehicle Owner");
        vehicleOwner.setPhoneNumber("3456789012");
        
        Set<Role> vehicleRoles = new HashSet<>();
        vehicleRoles.add(Role.ROLE_VEHICLE_OWNER);
        vehicleOwner.setRoles(vehicleRoles);
        userRepository.save(vehicleOwner);
        
        System.out.println("Created default users: admin, station, vehicle (all with password: 'password')");
    }
}