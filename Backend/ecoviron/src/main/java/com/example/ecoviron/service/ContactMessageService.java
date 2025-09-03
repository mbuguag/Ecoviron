package com.example.ecoviron.service;

import com.example.ecoviron.entity.ContactMessage;

import java.util.List;

public interface ContactMessageService {
    ContactMessage saveMessage(ContactMessage message);
    List<ContactMessage> getAllMessages();
}
