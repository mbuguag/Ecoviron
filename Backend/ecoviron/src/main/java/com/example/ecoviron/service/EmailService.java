package com.example.ecoviron.service;

import com.example.ecoviron.entity.ContactMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public void sendAdminNotification(ContactMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo("admin@example.com"); // Replace with your admin email
        mail.setFrom(sender);
        mail.setSubject("New Contact Message from " + message.getName());
        mail.setText(
                "Name: " + message.getName() + "\n" +
                        "Email: " + message.getEmail() + "\n" +
                        "Phone: " + message.getPhone() + "\n\n" +
                        "Message:\n" + message.getMessage()
        );

        mailSender.send(mail);
    }
}

