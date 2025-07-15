package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.ContactMessage;
import com.example.ecoviron.repository.ContactMessageRepository;
import com.example.ecoviron.service.ContactMessageService;
import com.example.ecoviron.service.EmailService;
import io.jsonwebtoken.lang.Assert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactMessageServiceImpl implements ContactMessageService {
    private final ContactMessageRepository repository;
    private final EmailService emailService;    @Override
    public ContactMessage saveMessage(ContactMessage message) {
        Assert.notNull(message, "Contact message cannot be null");
        log.info("Saving contact message from: {}", message.getEmail());

        // Set timestamp if needed
        if (message.getSubmittedAt() == null) {
            message.setSubmittedAt(LocalDateTime.now());
        }

        ContactMessage saved = repository.save(message);

        // ✅ Send both admin and confirmation email
        emailService.sendAdminNotification(saved);
        emailService.sendContactConfirmation(saved);

        return saved;
    }

    @Override
    public List<ContactMessage> getAllMessages() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"));
    }
}
