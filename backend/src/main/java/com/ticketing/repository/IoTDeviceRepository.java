package com.ticketing.repository;

import com.ticketing.model.IoTDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IoTDeviceRepository extends JpaRepository<IoTDevice, Long> {
    Optional<IoTDevice> findByName(String name);
}