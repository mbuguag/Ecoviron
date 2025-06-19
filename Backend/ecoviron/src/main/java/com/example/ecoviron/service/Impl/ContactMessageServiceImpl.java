package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.ContactMessage;
import com.example.ecoviron.repository.ContactMessageRepository;
import com.example.ecoviron.service.ContactMessageService;
import io.jsonwebtoken.lang.Assert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactMessageServiceImpl implements ContactMessageService {
    private final ContactMessageRepository repository;

    @Override
    public ContactMessage saveMessage(ContactMessage message) {
        Assert.notNull(message, "Contact message cannot be null");
        log.info("Saving contact message from: {}", message.getEmail());
        return repository.save(message);
    }

    @Override
    public List<ContactMessage> getAllMessages() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"));
    }
}
