package com.example.ecoviron.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ecoviron.entity.ContactMessage;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}
