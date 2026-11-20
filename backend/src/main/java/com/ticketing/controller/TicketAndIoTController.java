package com.ticketing.controller;

import com.ticketing.dto.ValidationRequest;
import com.ticketing.dto.ValidationResponse;
import com.ticketing.model.Event;
import com.ticketing.model.IoTDevice;
import com.ticketing.model.Ticket;
import com.ticketing.model.TicketStatus;
import com.ticketing.model.User;
import com.ticketing.repository.EventRepository;
import com.ticketing.repository.IoTDeviceRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class TicketAndIoTController {

    @Autowired private TicketRepository ticketRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private IoTDeviceRepository iotDeviceRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/tickets/my")
    public List<Object> getMyTickets(@AuthenticationPrincipal User user) {
        List<Ticket> tickets = ticketRepository.findByClientIdOrderByIdDesc(user.getId());
        List<Object> response = new ArrayList<>();

        for (Ticket t : tickets) {
            Event ev = eventRepository.findById(t.getEventId()).orElse(null);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", t.getQrHash());
            item.put("eventTitle", ev != null ? ev.getTitle() : "Unknown Event");
            item.put("venue", ev != null ? ev.getVenue() : "Venue");
            item.put("date", ev != null ? ev.getEventDate() : "");
            item.put("tier", t.getTier());
            item.put("seat", t.getSeatLabel());
            item.put("price", t.getPrice());
            item.put("status", t.getStatus().name());
            item.put("scannedAt", t.getScannedAt());
            item.put("scannedBy", t.getScannedByGate());
            response.add(item);
        }
        return response;
    }

    @PostMapping("/tickets/validate")
    @Transactional
    public ResponseEntity<ValidationResponse> validateAtGate(@RequestBody ValidationRequest req) {
        String gateName = req.getGateName() != null ? req.getGateName() : "GATE-01 Main Entrance";
        IoTDevice device = iotDeviceRepository.findByName(gateName).orElse(null);

        if (device != null && !Boolean.TRUE.equals(device.getOnline())) {
            return ResponseEntity.status(503).body(
                    new ValidationResponse(false, "GATE_OFFLINE", gateName + " is currently OFFLINE in System Admin.", null, null, null)
            );
        }

        if (device != null) {
            device.setScansProcessed(device.getScansProcessed() + 1);
            device.setLastHeartbeat("Just now");
            iotDeviceRepository.save(device);
        }

        Ticket ticket = ticketRepository.findByQrHash(req.getQrHash()).orElse(null);
        if (ticket == null) {
            return ResponseEntity.status(404).body(
                    new ValidationResponse(false, "UNKNOWN_OR_FORGED_QR", "Token not found in MySQL tickets table.", null, null, null)
            );
        }

        if (ticket.getStatus() == TicketStatus.USED) {
            return ResponseEntity.status(409).body(
                    new ValidationResponse(false, "REPLAY_DETECTED_TICKET_USED",
                            "Ticket already used at " + ticket.getScannedAt() + " (" + ticket.getScannedByGate() + ")",
                            ticket.getSeatLabel(), ticket.getTier(), ticket.getScannedAt())
            );
        }

        String nowStr = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        ticket.setStatus(TicketStatus.USED);
        ticket.setScannedAt(nowStr);
        ticket.setScannedByGate(gateName);
        ticketRepository.save(ticket);

        return ResponseEntity.ok(
                new ValidationResponse(true, "ACCESS_GRANTED", "Welcome! Gate unlocked for 3 seconds.",
                        ticket.getSeatLabel(), ticket.getTier(), nowStr)
        );
    }

    @GetMapping("/admin/devices")
    public List<IoTDevice> getAllDevices() {
        return iotDeviceRepository.findAll();
    }

    @PostMapping("/admin/devices/{id}/toggle")
    @Transactional
    public ResponseEntity<IoTDevice> toggleDevice(@PathVariable Long id) {
        IoTDevice dev = iotDeviceRepository.findById(id).orElseThrow();
        dev.setOnline(!Boolean.TRUE.equals(dev.getOnline()));
        dev.setLastHeartbeat(dev.getOnline() ? "Just now" : "Offline");
        return ResponseEntity.ok(iotDeviceRepository.save(dev));
    }

    @GetMapping("/admin/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/admin/users/{id}/payout")
    @Transactional
    public ResponseEntity<?> approvePayout(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow();
        BigDecimal paid = u.getNetBalance();
        u.setNetBalance(BigDecimal.ZERO);
        userRepository.save(u);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Payout of " + paid + " RON dispatched via SEPA.");
        response.put("user", u);
        return ResponseEntity.ok(response);
    }
}