package com.example.fuelQuotaManagementSystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    // Twilio Configuration
    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    // Configuration flags
    @Value("${notification.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${notification.mock.mode:true}")
    private boolean mockMode;

    private final RestTemplate restTemplate = new RestTemplate();


     //Send SMS notification using Twilio REST API

    public boolean sendSMS(String phoneNumber, String message) {
        if (!smsEnabled) {
            System.out.println("SMS disabled in configuration");
            return false;
        }

        if (mockMode) {
            return sendMockSMS(phoneNumber, message);
        }

        if (!isTwilioConfigured()) {
            System.err.println("Twilio not properly configured");
            System.err.println("Account SID: " + (twilioAccountSid != null && !twilioAccountSid.trim().isEmpty() ? "SET" : "MISSING"));
            System.err.println("Auth Token: " + (twilioAuthToken != null && !twilioAuthToken.trim().isEmpty() ? "SET" : "MISSING"));
            System.err.println("Phone Number: " + (twilioPhoneNumber != null && !twilioPhoneNumber.trim().isEmpty() ? "SET" : "MISSING"));
            return false;
        }

        try {
            // Format phone number for Sri Lanka
            String formattedPhoneNumber = formatSriLankanPhoneNumber(phoneNumber);

            // Twilio API URL
            String url = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", twilioAccountSid);

            // Create headers with Basic Auth
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String auth = twilioAccountSid + ":" + twilioAuthToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            // Create request body
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("From", twilioPhoneNumber);
            body.add("To", formattedPhoneNumber);
            body.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                System.out.println("SMS sent successfully to: " + formattedPhoneNumber);
                return true;
            } else {
                System.err.println("Failed to send SMS. Status: " + response.getStatusCode());
                System.err.println("Response: " + response.getBody());
                return false;
            }

        } catch (Exception e) {
            System.err.println("Error sending SMS: " + e.getMessage());
            e.printStackTrace();
            return false; // Simply return false when SMS fails
        }
    }


     //Send fuel transaction notification

    public boolean sendFuelTransactionNotification(String phoneNumber, String email,
                                                   String vehicleRegNo, String fuelType,
                                                   double amount, String stationName,
                                                   double remainingQuota, Long transactionId) {

        String smsMessage = createFuelTransactionSMSMessage(vehicleRegNo, fuelType, amount, stationName, remainingQuota, transactionId);


        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return sendSMS(phoneNumber, smsMessage);
        }

        System.out.println("No phone number provided for SMS notification");
        return false;
    }


     //Send quota status notification

    public boolean sendQuotaStatusNotification(String phoneNumber, String email, String vehicleRegNo,
                                               double remainingQuota, double allocatedQuota, String fuelType) {

        double usagePercentage = ((allocatedQuota - remainingQuota) / allocatedQuota) * 100;

        String smsMessage = String.format(
                "Fuel Quota Update: %s has %.1fL %s remaining (%.1f%% used). Plan your fuel usage accordingly.",
                vehicleRegNo, remainingQuota, fuelType, usagePercentage
        );

        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return sendSMS(phoneNumber, smsMessage);
        }

        return false;
    }


    public boolean sendLowQuotaWarning(String phoneNumber, String email, String vehicleRegNo,
                                       double remainingQuota, String fuelType, double warningThreshold) {

        String smsMessage = String.format(
                "Low Fuel Quota Alert: %s has only %.1fL %s remaining (below %.1fL threshold). Please refill soon!",
                vehicleRegNo, remainingQuota, fuelType, warningThreshold
        );

        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return sendSMS(phoneNumber, smsMessage);
        }

        return false;
    }


    public boolean sendQuotaExpiryWarning(String phoneNumber, String email, String vehicleRegNo,
                                          double remainingQuota, String expiryDate) {

        String smsMessage = String.format(
                "Fuel Quota Alert: Your %s has %.1fL remaining quota expiring on %s. Please use before expiry.",
                vehicleRegNo, remainingQuota, expiryDate
        );

        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return sendSMS(phoneNumber, smsMessage);
        }

        return false;
    }


     //Send new monthly quota allocation notification

    public boolean sendNewQuotaAllocationNotification(String phoneNumber, String email,
                                                      String vehicleRegNo, double allocatedQuota,
                                                      String month) {

        String smsMessage = String.format(
                "New Fuel Quota: Your %s has been allocated %.1fL quota for %s. Happy driving!",
                vehicleRegNo, allocatedQuota, month
        );

        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return sendSMS(phoneNumber, smsMessage);
        }

        return false;
    }


     //Format Sri Lankan phone numbers for international format

    private String formatSriLankanPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return null;

        // Remove any spaces, dashes, or parentheses
        String cleaned = phoneNumber.replaceAll("[\\s()-]", "");

        // Handle different Sri Lankan number formats
        if (cleaned.startsWith("0")) {
            // Convert 0771234567 to +94771234567
            return "+94" + cleaned.substring(1);
        } else if (cleaned.startsWith("94")) {
            // Convert 94771234567 to +94771234567
            return "+" + cleaned;
        } else if (cleaned.startsWith("+94")) {
            // Already in correct format
            return cleaned;
        } else if (cleaned.length() == 9) {
            // Assume it's missing the 0, like 771234567
            return "+94" + cleaned;
        }

        return phoneNumber; // Return as-is if we can't format it
    }


     //Create SMS message for fuel transaction

    private String createFuelTransactionSMSMessage(String vehicleRegNo, String fuelType,
                                                   double amount, String stationName,
                                                   double remainingQuota, Long transactionId) {
        return String.format(
                "Fuel Alert: %.1fL %s pumped at %s for %s. Remaining: %.1fL. Ref: #%d",
                amount, fuelType, stationName, vehicleRegNo, remainingQuota, transactionId
        );
    }


     //Check if Twilio is properly configured

    private boolean isTwilioConfigured() {
        return twilioAccountSid != null && !twilioAccountSid.trim().isEmpty() &&
                twilioAuthToken != null && !twilioAuthToken.trim().isEmpty() &&
                twilioPhoneNumber != null && !twilioPhoneNumber.trim().isEmpty();
    }


    private boolean sendMockSMS(String phoneNumber, String message) {
        System.out.println("=== MOCK SMS ===");
        System.out.println("To: " + phoneNumber);
        System.out.println("Message: " + message);
        System.out.println("SMS sent successfully (MOCK MODE)");
        System.out.println("===============");
        return true;
    }


    public Map<String, Object> testConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("smsEnabled", smsEnabled);
        config.put("mockMode", mockMode);
        config.put("twilioConfigured", isTwilioConfigured());

        return config;
    }


    public boolean testSMS(String phoneNumber) {
        String testMessage = "Test SMS from Fuel Quota Management System. Your SMS configuration is working!";
        return sendSMS(phoneNumber, testMessage);
    }
}