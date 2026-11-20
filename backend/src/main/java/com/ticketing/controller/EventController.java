package com.ticketing.controller;

import com.ticketing.model.Event;
import com.ticketing.model.Seat;
import com.ticketing.model.SeatStatus;
import com.ticketing.model.TicketStatus;
import com.ticketing.model.User;
import com.ticketing.repository.EventRepository;
import com.ticketing.repository.SeatRepository;
import com.ticketing.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class EventController {

    @Autowired private EventRepository eventRepository;
    @Autowired private SeatRepository seatRepository;
    @Autowired private TicketRepository ticketRepository;

    @GetMapping("/events")
    public List<Object> getAllEvents() {
        List<Event> events = eventRepository.findAllByOrderByIdDesc();
        List<Object> result = new ArrayList<>();

        for (Event ev : events) {
            long soldCount = seatRepository.countByEventIdAndStatus(ev.getId(), SeatStatus.SOLD);
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", ev.getId());
            dto.put("title", ev.getTitle());
            dto.put("category", ev.getCategory());
            dto.put("venue", ev.getVenue());
            dto.put("date", ev.getEventDate());
            dto.put("vipPrice", ev.getVipPrice());
            dto.put("goldenPrice", ev.getGoldenPrice());
            dto.put("gaPrice", ev.getGaPrice());
            dto.put("totalCapacity", ev.getTotalCapacity());
            dto.put("soldCount", soldCount);
            dto.put("gradient", ev.getGradient());
            dto.put("badge", ev.getBadge());
            result.add(dto);
        }
        return result;
    }

    @GetMapping("/events/{eventId}/seats")
    public List<Seat> getSeats(@PathVariable Long eventId) {
        return seatRepository.findByEventIdOrderByIdAsc(eventId);
    }

    @PostMapping("/organizer/events")
    @Transactional
    public ResponseEntity<Event> createEvent(@RequestBody Event req, @AuthenticationPrincipal User user) {
        req.setOrganizerId(user.getId());
        req.setTotalCapacity(48);
        if (req.getGoldenPrice() == null) {
            req.setGoldenPrice((req.getVipPrice() + req.getGaPrice()) / 2);
        }
        if (req.getGradient() == null) {
            req.setGradient("from-cyan-600/30 via-emerald-900/40 to-slate-900");
        }
        if (req.getBadge() == null) {
            req.setBadge("New Release");
        }
        Event saved = eventRepository.save(req);

        String[] rows = {"A", "B", "C", "D", "E", "F"};
        List<Seat> seats = new ArrayList<>();
        for (int r = 0; r < rows.length; r++) {
            String tier = r <= 1 ? "VIP Front Stage" : (r <= 3 ? "Golden Circle" : "General Access");
            int price = r <= 1 ? saved.getVipPrice() : (r <= 3 ? saved.getGoldenPrice() : saved.getGaPrice());
            for (int num = 1; num <= 8; num++) {
                Seat s = new Seat();
                s.setEventId(saved.getId());
                s.setSeatIdentifier(rows[r] + num);
                s.setTier(tier);
                s.setPrice(price);
                s.setStatus(SeatStatus.AVAILABLE);
                seats.add(s);
            }
        }
        seatRepository.saveAll(seats);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/organizer/stats")
    public Map<String, Object> getOrganizerStats() {
        List<Event> events = eventRepository.findAll();
        long totalSold = 0;
        long totalRevenue = 0;
        for (Event ev : events) {
            long sold = seatRepository.countByEventIdAndStatus(ev.getId(), SeatStatus.SOLD);
            totalSold += sold;
            totalRevenue += sold * ev.getGaPrice();
        }
        long totalTickets = ticketRepository.count();
        long usedTickets = ticketRepository.countByStatus(TicketStatus.USED);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalSold", totalSold);
        stats.put("totalCapacity", events.size() * 48L);
        stats.put("totalTickets", totalTickets);
        stats.put("usedTickets", usedTickets);
        return stats;
    }
}