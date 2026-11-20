package com.ticketing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "seat_identifier")
    private String seatIdentifier;

    private String tier;
    private Integer price;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @Column(name = "locked_by_user_id")
    private Long lockedByUserId;

    @Column(name = "lock_expiration")
    private LocalDateTime lockExpiration;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getSeatIdentifier() { return seatIdentifier; }
    public void setSeatIdentifier(String seatIdentifier) { this.seatIdentifier = seatIdentifier; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public SeatStatus getStatus() { return status; }
    public void setStatus(SeatStatus status) { this.status = status; }
    public Long getLockedByUserId() { return lockedByUserId; }
    public void setLockedByUserId(Long lockedByUserId) { this.lockedByUserId = lockedByUserId; }
    public LocalDateTime getLockExpiration() { return lockExpiration; }
    public void setLockExpiration(LocalDateTime lockExpiration) { this.lockExpiration = lockExpiration; }
}