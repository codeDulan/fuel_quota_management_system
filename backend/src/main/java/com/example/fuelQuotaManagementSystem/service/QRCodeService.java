package com.example.fuelQuotaManagementSystem.service;

import com.example.fuelQuotaManagementSystem.entity.Vehicle;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {

    private final ObjectMapper objectMapper = new ObjectMapper();


    public String generateQRCode(Vehicle vehicle) {
        try {
            // Create QR data object
            Map<String, Object> qrData = new HashMap<>();
            qrData.put("regNo", vehicle.getRegistrationNumber());
            qrData.put("chassis", vehicle.getChassisNumber());
            qrData.put("type", vehicle.getVehicleType());
            qrData.put("fuel", vehicle.getFuelType());
            qrData.put("engine", vehicle.getEngineCapacity());
            qrData.put("timestamp", System.currentTimeMillis());

            // Add security hash to prevent tampering
            String dataString = objectMapper.writeValueAsString(qrData);
            String hash = generateSecurityHash(dataString);
            qrData.put("hash", hash);

            // Convert to JSON string
            String qrCodeData = objectMapper.writeValueAsString(qrData);

            // Encode to Base64 for storage
            return Base64.getEncoder().encodeToString(qrCodeData.getBytes(StandardCharsets.UTF_8));

        } catch (Exception e) {
            throw new RuntimeException("Error generating QR code: " + e.getMessage());
        }
    }


    public String decodeQRCode(String qrCodeData) {
        try {
            // Decode from Base64
            String decodedData = new String(Base64.getDecoder().decode(qrCodeData), StandardCharsets.UTF_8);

            // Parse JSON
            Map<String, Object> qrData = objectMapper.readValue(decodedData, Map.class);

            // Extract registration number
            String registrationNumber = (String) qrData.get("regNo");

            if (registrationNumber == null || registrationNumber.isEmpty()) {
                throw new RuntimeException("Invalid QR code: Missing registration number");
            }

            // Validate security hash
            String receivedHash = (String) qrData.get("hash");
            qrData.remove("hash"); // Remove hash for validation

            String dataForValidation = objectMapper.writeValueAsString(qrData);
            String expectedHash = generateSecurityHash(dataForValidation);

            if (!expectedHash.equals(receivedHash)) {
                throw new RuntimeException("Invalid QR code: Security validation failed");
            }

            return registrationNumber;

        } catch (Exception e) {
            throw new RuntimeException("Error decoding QR code: " + e.getMessage());
        }
    }


    public Map<String, Object> getVehicleInfoFromQR(String qrCodeData) {
        try {
            // Decode from Base64
            String decodedData = new String(Base64.getDecoder().decode(qrCodeData), StandardCharsets.UTF_8);

            // Parse JSON
            Map<String, Object> qrData = objectMapper.readValue(decodedData, Map.class);

            // Validate security hash
            String receivedHash = (String) qrData.get("hash");
            qrData.remove("hash"); // Remove hash for validation

            String dataForValidation = objectMapper.writeValueAsString(qrData);
            String expectedHash = generateSecurityHash(dataForValidation);

            if (!expectedHash.equals(receivedHash)) {
                throw new RuntimeException("Invalid QR code: Security validation failed");
            }

            return qrData;

        } catch (Exception e) {
            throw new RuntimeException("Error extracting vehicle info from QR code: " + e.getMessage());
        }
    }


    public String generateQRCodeImage(String qrData, int width, int height) {
        try {
            // Create a simple visual representation
            // In production, replace this with actual QR code generation using ZXing library
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = image.createGraphics();

            // Set background to white
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, width, height);

            // Create a pattern to represent QR code
            g2d.setColor(Color.BLACK);

            // Draw border
            g2d.drawRect(10, 10, width - 20, height - 20);

            // Draw some pattern squares to simulate QR code
            int squareSize = 8;
            for (int x = 20; x < width - 20; x += squareSize * 2) {
                for (int y = 20; y < height - 20; y += squareSize * 2) {
                    if ((x + y) % 32 == 0) {
                        g2d.fillRect(x, y, squareSize, squareSize);
                    }
                }
            }

            // Add corner squares (typical QR code feature)
            g2d.fillRect(15, 15, 30, 30);
            g2d.fillRect(width - 45, 15, 30, 30);
            g2d.fillRect(15, height - 45, 30, 30);

            // Add registration number text at bottom
            g2d.setFont(new Font("Arial", Font.BOLD, 12));
            FontMetrics fm = g2d.getFontMetrics();

            Map<String, Object> vehicleInfo = getVehicleInfoFromQR(qrData);
            String regNo = (String) vehicleInfo.get("regNo");

            int textX = (width - fm.stringWidth(regNo)) / 2;
            g2d.drawString(regNo, textX, height - 5);

            g2d.dispose();

            // Convert to Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            return Base64.getEncoder().encodeToString(imageBytes);

        } catch (IOException e) {
            throw new RuntimeException("Error generating QR code image: " + e.getMessage());
        }
    }


    public boolean isValidQRCode(String qrCodeData) {
        try {
            decodeQRCode(qrCodeData);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


    private String generateSecurityHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((data + "FUEL_QUOTA_SECRET_SALT").getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating security hash: " + e.getMessage());
        }
    }


    public boolean isQRCodeExpired(String qrCodeData, long expiryHours) {
        try {
            Map<String, Object> vehicleInfo = getVehicleInfoFromQR(qrCodeData);
            Long timestamp = ((Number) vehicleInfo.get("timestamp")).longValue();
            long currentTime = System.currentTimeMillis();
            long expiryTime = timestamp + (expiryHours * 60 * 60 * 1000);

            return currentTime > expiryTime;
        } catch (Exception e) {
            return true; // Consider expired if we can't determine
        }
    }
}