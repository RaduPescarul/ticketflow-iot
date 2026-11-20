package com.ticketing.repository;

import com.ticketing.model.Ticket;
import com.ticketing.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByQrHash(String qrHash);
    List<Ticket> findByClientIdOrderByIdDesc(Long clientId);
    long countByStatus(TicketStatus status);
}