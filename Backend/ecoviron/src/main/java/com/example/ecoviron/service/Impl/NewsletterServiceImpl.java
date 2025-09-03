package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.NewsletterSubscriber;
import com.example.ecoviron.repository.NewsletterSubscriberRepository;
import com.example.ecoviron.service.NewsletterService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsletterServiceImpl implements NewsletterService {

    private final NewsletterSubscriberRepository repository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${newsletter.confirmation-url}")
    private String confirmationBaseUrl;

    @Value("${newsletter.unsubscribe-url}")
    private String unsubscribeBaseUrl;

    @Override
    public void subscribe(String email) {
        Optional<NewsletterSubscriber> existingOpt = repository.findByEmail(email);

        if (existingOpt.isPresent()) {
            NewsletterSubscriber existing = existingOpt.get();

            if (existing.isConfirmed() && !existing.isUnsubscribed()) {
                // Already confirmed and active
                return;
            }

            // Re-subscribe logic
            existing.setUnsubscribed(false);
            existing.setConfirmed(false);
            existing.setConfirmationToken(UUID.randomUUID().toString());
            existing.setSubscribedAt(LocalDateTime.now());

            repository.save(existing);
            sendConfirmationEmail(existing);
            return;
        }

        // New subscriber
        NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                .email(email)
                .confirmed(false)
                .unsubscribed(false)
                .confirmationToken(UUID.randomUUID().toString())
                .subscribedAt(LocalDateTime.now())
                .build();

        repository.save(subscriber);
        sendConfirmationEmail(subscriber);
    }

    @Override
    public void confirmSubscription(String token) {
        NewsletterSubscriber subscriber = repository.findByConfirmationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid confirmation token"));

        subscriber.setConfirmed(true);
        subscriber.setConfirmationToken(null); // Invalidate token
        repository.save(subscriber);
    }

    @Override
    public void unsubscribe(String token) {
        NewsletterSubscriber subscriber = repository.findByConfirmationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid unsubscribe token"));

        subscriber.setUnsubscribed(true);
        subscriber.setConfirmed(false);
        repository.save(subscriber);
    }

    @Override
    public List<NewsletterSubscriber> getAllSubscribers() {
        return repository.findAllByConfirmedTrueAndUnsubscribedFalse();
    }

    @Override
    public void sendNewsletter(String subject, String content) {
        List<NewsletterSubscriber> recipients = getAllSubscribers();

        for (NewsletterSubscriber subscriber : recipients) {
            try {
                sendNewsletterEmail(subscriber.getEmail(), subject, content, subscriber.getId());
            } catch (Exception e) {
                e.printStackTrace(); // Log failure
            }
        }
    }

    // ======= EMAILS =======

    private void sendConfirmationEmail(NewsletterSubscriber subscriber) {
        String confirmUrl = confirmationBaseUrl + "?token=" + subscriber.getConfirmationToken();
        String unsubscribeUrl = unsubscribeBaseUrl + "?token=" + subscriber.getConfirmationToken();

        String html = """
            <h2>Welcome to Ecoviron Newsletter!</h2>
            <p>Click the button below to confirm your subscription:</p>
            <p><a href="%s" style="background-color: #4CAF50; padding: 10px 20px; color: white; text-decoration: none;">Confirm Subscription</a></p>
            <hr/>
            <p>If you did not request this, you can ignore it or <a href="%s">unsubscribe</a>.</p>
        """.formatted(confirmUrl, unsubscribeUrl);

        sendHtmlEmail(subscriber.getEmail(), "Confirm your subscription to Ecoviron", html);
    }

    private void sendNewsletterEmail(String to, String subject, String content, Long subscriberId) {
        String unsubscribeUrl = unsubscribeBaseUrl + "?id=" + subscriberId;

        String html = """
            <div style="font-family: Arial, sans-serif;">
                <p>%s</p>
                <hr/>
                <p style="font-size: 12px;">Don't want these emails? <a href="%s">Unsubscribe</a></p>
            </div>
        """.formatted(content, unsubscribeUrl);

        sendHtmlEmail(to, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }
}
