package com.example.ecoviron.controller;

import com.example.ecoviron.entity.ContactMessage;
import com.example.ecoviron.service.ContactMessageService;
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

    @PostMapping
    public ResponseEntity<ContactMessage> submitMessage(@RequestBody ContactMessage message) {
        return new ResponseEntity<>(service.saveMessage(message), HttpStatus.CREATED);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(service.getAllMessages());
    }
}
