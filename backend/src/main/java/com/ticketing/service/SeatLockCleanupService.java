package com.ticketing.service;

import com.ticketing.model.Seat;
import com.ticketing.model.SeatStatus;
import com.ticketing.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatLockCleanupService {

    @Autowired
    private SeatRepository seatRepository;

    @Scheduled(fixedRate = 10000) // Runs every 10 seconds to release expired 5-min locks
    @Transactional
    public void releaseExpiredSeatLocks() {
        List<Seat> expired = seatRepository.findExpiredLocks(LocalDateTime.now());
        for (Seat seat : expired) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockedByUserId(null);
            seat.setLockExpiration(null);
        }
        if (!expired.isEmpty()) {
            seatRepository.saveAll(expired);
        }
    }
}