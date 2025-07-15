package com.example.ecoviron.controller;

import com.example.ecoviron.entity.ContactMessage;
import com.example.ecoviron.service.ContactMessageService;
import com.example.ecoviron.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageService service;

    private final EmailService emailService;
    @PostMapping
    public ResponseEntity<ContactMessage> submitMessage(@RequestBody ContactMessage message) {
        ContactMessage saved = service.saveMessage(message);

        //  Send email to admin
        emailService.sendAdminNotification(saved);

        //  Send confirmation to sender
        emailService.sendContactConfirmation(saved);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(service.getAllMessages());
    }
}
