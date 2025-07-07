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

    @Value("${app.reset-password.base-url:http://localhost:5500/frontend/auth/reset-password.html}")
    private String resetPasswordBaseUrl;

    /**
     * Sends admin a notification when a contact form is submitted
     */
    public void sendAdminNotification(ContactMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo("admin@example.com"); // Replace with actual admin
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

    /**
     * Sends password reset instructions to the user's email
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = resetPasswordBaseUrl + "?token=" + resetToken;

        String subject = "Reset Your Password - Ecoviron";
        String body = "Hi,\n\n" +
                "We received a request to reset your password. Click the link below to proceed:\n" +
                resetLink + "\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\nEcoviron Team";

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(toEmail);
        mail.setFrom(sender);
        mail.setSubject(subject);
        mail.setText(body);

        mailSender.send(mail);
    }
}
