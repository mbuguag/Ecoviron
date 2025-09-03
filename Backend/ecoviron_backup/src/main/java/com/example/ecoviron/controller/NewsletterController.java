package com.example.ecoviron.controller;

import com.example.ecoviron.entity.NewsletterSubscriber;
import com.example.ecoviron.service.NewsletterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class NewsletterController {

    @Autowired
    private NewsletterService service;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        try {
            service.subscribe(email);
            return ResponseEntity.ok("Subscribed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirm(@RequestParam String token) {
        service.confirmSubscription(token);
        return ResponseEntity.ok("Subscription confirmed. Thank you!");
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendNewsletter(@RequestBody Map<String, String> payload) {
        String subject = payload.get("subject");
        String body = payload.get("body");
        service.sendNewsletter(subject, body);
        return ResponseEntity.ok("Newsletter sent to all subscribers.");
    }

    @GetMapping("/all")
    public List<NewsletterSubscriber> getAllSubscribers() {
        return service.getAllSubscribers();
    }

    @GetMapping("/unsubscribe")
    public ResponseEntity<String> unsubscribe(@RequestParam String email) {
        service.unsubscribe(email);
        return ResponseEntity.ok("You have been unsubscribed.");
    }
}
