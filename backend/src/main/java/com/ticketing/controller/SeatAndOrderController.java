package com.ticketing.controller;

import com.ticketing.dto.CheckoutRequest;
import com.ticketing.model.Event;
import com.ticketing.model.Seat;
import com.ticketing.model.SeatStatus;
import com.ticketing.model.Ticket;
import com.ticketing.model.TicketStatus;
import com.ticketing.model.User;
import com.ticketing.repository.EventRepository;
import com.ticketing.repository.SeatRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

@RestController
@RequestMapping("/api/v1")
public class SeatAndOrderController {

    @Autowired private SeatRepository seatRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private UserRepository userRepository;

    @PostMapping("/seats/{seatId}/toggle-lock")
    @Transactional
    public ResponseEntity<?> toggleSeatLock(@PathVariable Long seatId, @AuthenticationPrincipal User user) {
        Seat seat = seatRepository.findByIdWithPessimisticLock(seatId).orElse(null);
        if (seat == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Seat not found"));
        }

        if (seat.getStatus() == SeatStatus.LOCKED && Objects.equals(seat.getLockedByUserId(), user.getId())) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockedByUserId(null);
            seat.setLockExpiration(null);
            return ResponseEntity.ok(seatRepository.save(seat));
        }

        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            return ResponseEntity.status(409).body(Map.of("message", "Seat is currently locked or sold"));
        }

        seat.setStatus(SeatStatus.LOCKED);
        seat.setLockedByUserId(user.getId());
        seat.setLockExpiration(LocalDateTime.now().plusMinutes(5));
        return ResponseEntity.ok(seatRepository.save(seat));
    }

    @PostMapping("/orders/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest req, @AuthenticationPrincipal User user) {
        Event event = eventRepository.findById(req.getEventId()).orElse(null);
        if (event == null || req.getSeatIds() == null || req.getSeatIds().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid checkout payload"));
        }

        List<Ticket> issuedTickets = new ArrayList<>();
        int totalAmount = 0;

        for (Long seatId : req.getSeatIds()) {
            Seat seat = seatRepository.findByIdWithPessimisticLock(seatId).orElse(null);
            if (seat == null || seat.getStatus() == SeatStatus.SOLD) {
                return ResponseEntity.status(409).body(Map.of("message", "One or more seats are no longer available"));
            }

            seat.setStatus(SeatStatus.SOLD);
            seat.setLockedByUserId(null);
            seat.setLockExpiration(null);
            seatRepository.save(seat);

            String prefix = event.getTitle().replaceAll("[^A-Za-z]", "").toUpperCase();
            prefix = prefix.length() >= 3 ? prefix.substring(0, 3) : "TKT";
            String qrHash = "TKT-" + prefix + "-" + (1000 + new Random().nextInt(9000));

            Ticket tkt = new Ticket();
            tkt.setQrHash(qrHash);
            tkt.setEventId(event.getId());
            tkt.setSeatId(seat.getId());
            tkt.setClientId(user.getId());
            tkt.setTier(seat.getTier());
            tkt.setSeatLabel("Row " + seat.getSeatIdentifier().charAt(0) + " • Seat " + seat.getSeatIdentifier().substring(1));
            tkt.setPrice(seat.getPrice());
            tkt.setStatus(TicketStatus.ACTIVE);
            issuedTickets.add(ticketRepository.save(tkt));

            totalAmount += seat.getPrice();
        }

        User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
        if (organizer != null) {
            organizer.setNetBalance(organizer.getNetBalance().add(BigDecimal.valueOf(totalAmount)));
            userRepository.save(organizer);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("issuedCount", issuedTickets.size());
        response.put("tickets", issuedTickets);
        return ResponseEntity.ok(response);
    }
}