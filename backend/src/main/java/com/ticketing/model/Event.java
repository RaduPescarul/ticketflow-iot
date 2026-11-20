package com.ticketing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;
    private String venue;

    @Column(name = "event_date")
    private String eventDate;

    @Column(name = "vip_price")
    private Integer vipPrice;

    @Column(name = "golden_price")
    private Integer goldenPrice;

    @Column(name = "ga_price")
    private Integer gaPrice;

    @Column(name = "total_capacity")
    private Integer totalCapacity = 48;

    private String gradient;
    private String badge;

    @Column(name = "organizer_id")
    private Long organizerId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public Integer getVipPrice() { return vipPrice; }
    public void setVipPrice(Integer vipPrice) { this.vipPrice = vipPrice; }
    public Integer getGoldenPrice() { return goldenPrice; }
    public void setGoldenPrice(Integer goldenPrice) { this.goldenPrice = goldenPrice; }
    public Integer getGaPrice() { return gaPrice; }
    public void setGaPrice(Integer gaPrice) { this.gaPrice = gaPrice; }
    public Integer getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Integer totalCapacity) { this.totalCapacity = totalCapacity; }
    public String getGradient() { return gradient; }
    public void setGradient(String gradient) { this.gradient = gradient; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
}