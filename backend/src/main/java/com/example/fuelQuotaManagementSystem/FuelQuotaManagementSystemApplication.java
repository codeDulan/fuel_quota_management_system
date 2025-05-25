package com.example.fuelQuotaManagementSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FuelQuotaManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(FuelQuotaManagementSystemApplication.class, args);
	}

}
