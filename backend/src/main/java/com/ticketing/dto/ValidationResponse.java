package com.ticketing.dto;

public class ValidationResponse {
    private boolean accessGranted;
    private String code;
    private String message;
    private String seatLabel;
    private String tier;
    private String scannedAt;

    public ValidationResponse(boolean accessGranted, String code, String message, String seatLabel, String tier, String scannedAt) {
        this.accessGranted = accessGranted;
        this.code = code;
        this.message = message;
        this.seatLabel = seatLabel;
        this.tier = tier;
        this.scannedAt = scannedAt;
    }

    public boolean isAccessGranted() { return accessGranted; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public String getSeatLabel() { return seatLabel; }
    public String getTier() { return tier; }
    public String getScannedAt() { return scannedAt; }
}