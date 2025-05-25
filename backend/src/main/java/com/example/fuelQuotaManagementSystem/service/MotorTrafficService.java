package com.example.fuelQuotaManagementSystem.service;

import com.example.fuelQuotaManagementSystem.dto.DMTVehicleInfo;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class MotorTrafficService {

    // Mock DMT database - In real scenario, this would be an external API call
    private final Map<String, DMTVehicleInfo> dmtDatabase;

    public MotorTrafficService() {
        this.dmtDatabase = new HashMap<>();
        initializeMockData();
    }


    public Optional<DMTVehicleInfo> validateVehicle(String registrationNumber, String chassisNumber) {
        DMTVehicleInfo vehicleInfo = dmtDatabase.get(registrationNumber.toUpperCase());

        if (vehicleInfo != null && vehicleInfo.getChassisNumber().equals(chassisNumber)) {
            return Optional.of(vehicleInfo);
        }

        return Optional.empty();
    }


    public boolean isValidRegistrationNumber(String registrationNumber) {
        return dmtDatabase.containsKey(registrationNumber.toUpperCase());
    }


    public Optional<DMTVehicleInfo> getVehicleInfo(String registrationNumber) {
        return Optional.ofNullable(dmtDatabase.get(registrationNumber.toUpperCase()));
    }

    private void initializeMockData() {
        // Cars - Western Province (WP)
        dmtDatabase.put("WP-CAB-1234", new DMTVehicleInfo(
                "WP-CAB-1234", "1HGBH41JXMN109186", "Car", "Petrol",
                1300.0, "Toyota", "Aqua", 2018, "Colombo", "Active"
        ));

        dmtDatabase.put("WP-CAR-5678", new DMTVehicleInfo(
                "WP-CAR-5678", "WVWZZZ3CZNE516285", "Car", "Petrol",
                1500.0, "Volkswagen", "Polo", 2020, "Gampaha", "Active"
        ));

        dmtDatabase.put("WP-CBB-9012", new DMTVehicleInfo(
                "WP-CBB-9012", "MA1TB2HU8A0001234", "Car", "Petrol",
                1200.0, "Suzuki", "Alto", 2019, "Kalutara", "Active"
        ));

        // Motorcycles - Western Province
        dmtDatabase.put("WP-QA-1111", new DMTVehicleInfo(
                "WP-QA-1111", "MD2TE01J3A2001234", "Motorcycle", "Petrol",
                125.0, "Honda", "CB125F", 2021, "Colombo", "Active"
        ));

        dmtDatabase.put("WP-QB-2222", new DMTVehicleInfo(
                "WP-QB-2222", "YT9TE05J5B3001234", "Motorcycle", "Petrol",
                150.0, "Yamaha", "FZ-FI", 2020, "Mount Lavinia", "Active"
        ));

        // Three Wheelers - Western Province
        dmtDatabase.put("WP-TA-3333", new DMTVehicleInfo(
                "WP-TA-3333", "TV3TE05J5C4001234", "Three Wheeler", "Petrol",
                200.0, "TVS", "King", 2019, "Dehiwala", "Active"
        ));

        dmtDatabase.put("WP-TB-4444", new DMTVehicleInfo(
                "WP-TB-4444", "BJ3TE05J5D5001234", "Three Wheeler", "Petrol",
                200.0, "Bajaj", "RE Compact", 2020, "Moratuwa", "Active"
        ));

        // Diesel Vehicles
        dmtDatabase.put("WP-CAA-7890", new DMTVehicleInfo(
                "WP-CAA-7890", "KMHD35LA3AU001234", "Car", "Diesel",
                1600.0, "Hyundai", "Elantra", 2017, "Colombo", "Active"
        ));

        dmtDatabase.put("WP-CAD-1357", new DMTVehicleInfo(
                "WP-CAD-1357", "WDDGF4HB9CA001234", "Car", "Diesel",
                2200.0, "Mercedes-Benz", "C200", 2016, "Colombo 07", "Active"
        ));

        // Central Province (CP)
        dmtDatabase.put("CP-CAB-2468", new DMTVehicleInfo(
                "CP-CAB-2468", "JN1AZ4EH8DM001234", "Car", "Petrol",
                1500.0, "Nissan", "March", 2019, "Kandy", "Active"
        ));

        dmtDatabase.put("CP-QA-5555", new DMTVehicleInfo(
                "CP-QA-5555", "HD2TE01J3E6001234", "Motorcycle", "Petrol",
                125.0, "Hero", "Splendor", 2020, "Matale", "Active"
        ));

        // Southern Province (SP)
        dmtDatabase.put("SP-CAB-3691", new DMTVehicleInfo(
                "SP-CAB-3691", "MA3FW21S2J0001234", "Car", "Petrol",
                1300.0, "Suzuki", "Swift", 2018, "Galle", "Active"
        ));

        dmtDatabase.put("SP-QB-6666", new DMTVehicleInfo(
                "SP-QB-6666", "YM2TE05J5F7001234", "Motorcycle", "Petrol",
                110.0, "Yamaha", "Ray ZR", 2021, "Matara", "Active"
        ));

        // Northern Province (NP)
        dmtDatabase.put("NP-CAB-1472", new DMTVehicleInfo(
                "NP-CAB-1472", "MRHFJ24A3G8001234", "Car", "Petrol",
                1000.0, "Maruti", "Alto", 2020, "Jaffna", "Active"
        ));

        // Eastern Province (EP)
        dmtDatabase.put("EP-CAB-2583", new DMTVehicleInfo(
                "EP-CAB-2583", "TKLKA22L3H9001234", "Car", "Petrol",
                1200.0, "Tata", "Indica", 2017, "Batticaloa", "Active"
        ));

        // North Western Province (NWP)
        dmtDatabase.put("NWP-CAB-3694", new DMTVehicleInfo(
                "NWP-CAB-3694", "SBMKA22L3I0001234", "Car", "Petrol",
                1400.0, "Suzuki", "Baleno", 2019, "Kurunegala", "Active"
        ));

        // North Central Province (NCP)
        dmtDatabase.put("NCP-CAB-4705", new DMTVehicleInfo(
                "NCP-CAB-4705", "HYUKA22L3J1001234", "Car", "Petrol",
                1600.0, "Hyundai", "i20", 2020, "Anuradhapura", "Active"
        ));

        // Uva Province (UP)
        dmtDatabase.put("UP-CAB-5816", new DMTVehicleInfo(
                "UP-CAB-5816", "KIGA22L3K2001234", "Car", "Petrol",
                1100.0, "Kia", "Picanto", 2018, "Badulla", "Active"
        ));

        // Sabaragamuwa Province (SGP)
        dmtDatabase.put("SGP-CAB-6927", new DMTVehicleInfo(
                "SGP-CAB-6927", "MZGA22L3L3001234", "Car", "Petrol",
                1800.0, "Mazda", "Demio", 2019, "Ratnapura", "Active"
        ));

        // Commercial Vehicles
        dmtDatabase.put("WP-LD-1234", new DMTVehicleInfo(
                "WP-LD-1234", "TATLD22L3M4001234", "Lorry", "Diesel",
                3000.0, "TATA", "407", 2016, "Colombo", "Active"
        ));

        dmtDatabase.put("WP-BUS-5678", new DMTVehicleInfo(
                "WP-BUS-5678", "ASHBUS22L3N5001234", "Bus", "Diesel",
                4000.0, "Ashok Leyland", "Viking", 2017, "Gampaha", "Active"
        ));

        // Inactive/Suspended vehicles for testing
        dmtDatabase.put("WP-CAB-0000", new DMTVehicleInfo(
                "WP-CAB-0000", "SUSPENDED001234567", "Car", "Petrol",
                1300.0, "Toyota", "Vitz", 2015, "Colombo", "Suspended"
        ));
    }
}