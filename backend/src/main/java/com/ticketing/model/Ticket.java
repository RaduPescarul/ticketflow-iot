package com.ticketing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "qr_hash", unique = true)
    private String qrHash;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "seat_id")
    private Long seatId;

    @Column(name = "client_id")
    private Long clientId;

    private String tier;

    @Column(name = "seat_label")
    private String seatLabel;

    private Integer price;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Column(name = "scanned_at")
    private String scannedAt;

    @Column(name = "scanned_by_gate")
    private String scannedByGate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQrHash() { return qrHash; }
    public void setQrHash(String qrHash) { this.qrHash = qrHash; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public String getSeatLabel() { return seatLabel; }
    public void setSeatLabel(String seatLabel) { this.seatLabel = seatLabel; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getScannedAt() { return scannedAt; }
    public void setScannedAt(String scannedAt) { this.scannedAt = scannedAt; }
    public String getScannedByGate() { return scannedByGate; }
    public void setScannedByGate(String scannedByGate) { this.scannedByGate = scannedByGate; }
}