package com.ticketing.dto;

public class ValidationRequest {
    private String qrHash;
    private String gateName;

    public String getQrHash() { return qrHash; }
    public void setQrHash(String qrHash) { this.qrHash = qrHash; }
    public String getGateName() { return gateName; }
    public void setGateName(String gateName) { this.gateName = gateName; }
}