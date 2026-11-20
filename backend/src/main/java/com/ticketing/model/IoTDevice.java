package com.ticketing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "iot_devices")
public class IoTDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_code", unique = true)
    private String deviceCode;

    private String name;

    @Column(name = "hardware_mac")
    private String hardwareMac;

    private String venue;

    @Column(name = "scans_processed")
    private Integer scansProcessed;

    @Column(name = "last_heartbeat")
    private String lastHeartbeat;

    private Boolean online;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHardwareMac() { return hardwareMac; }
    public void setHardwareMac(String hardwareMac) { this.hardwareMac = hardwareMac; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public Integer getScansProcessed() { return scansProcessed; }
    public void setScansProcessed(Integer scansProcessed) { this.scansProcessed = scansProcessed; }
    public String getLastHeartbeat() { return lastHeartbeat; }
    public void setLastHeartbeat(String lastHeartbeat) { this.lastHeartbeat = lastHeartbeat; }
    public Boolean getOnline() { return online; }
    public void setOnline(Boolean online) { this.online = online; }
}