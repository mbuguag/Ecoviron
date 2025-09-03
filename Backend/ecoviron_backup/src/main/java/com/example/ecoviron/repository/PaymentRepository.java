package com.example.ecoviron.repository;

import com.example.ecoviron.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByMpesaReceiptNumber(String mpesaReceiptNumber);
}
