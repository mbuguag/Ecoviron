package com.example.ecoviron.service.Impl;

import com.example.ecoviron.config.AppProperties;
import com.example.ecoviron.entity.NewsletterSubscriber;
import com.example.ecoviron.repository.NewsletterSubscriberRepository;
import com.example.ecoviron.service.NewsletterService;
import com.example.ecoviron.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsletterServiceImpl implements NewsletterService {

    private final NewsletterSubscriberRepository subscriberRepository;
    private final EmailService emailService;
    private final AppProperties appProperties;

    @Override
    @Transactional
    public void subscribe(String email) {
        Optional<NewsletterSubscriber> existing = subscriberRepository.findByEmail(email);

        if (existing.isPresent()) {
            NewsletterSubscriber subscriber = existing.get();
            if (subscriber.isConfirmed() && !subscriber.isUnsubscribed()) {
                throw new IllegalArgumentException("Email is already subscribed to the newsletter.");
            } else {
                // Reset unsubscribe flag and resend confirmation
                subscriber.setUnsubscribed(false);
                subscriber.setConfirmationToken(UUID.randomUUID().toString());
                subscriberRepository.save(subscriber);
                sendConfirmationEmail(subscriber);
                return;
            }
        }

        NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                .email(email)
                .confirmed(false)
                .unsubscribed(false)
                .confirmationToken(UUID.randomUUID().toString())
                .subscribedAt(LocalDateTime.now())
                .build();

        subscriberRepository.save(subscriber);
        sendConfirmationEmail(subscriber);
    }

    @Override
    @Transactional
    public void confirmSubscription(String token) {
        NewsletterSubscriber subscriber = subscriberRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired confirmation token."));

        subscriber.setConfirmed(true);
        subscriber.setConfirmedAt(LocalDateTime.now());
        subscriber.setConfirmationToken(null); // clear token after use
        subscriberRepository.save(subscriber);

        emailService.sendNewsletter(
                "🎉 Welcome to Ecoviron Newsletter!",
                "Hi " + subscriber.getEmail() + ",\n\n" +
                        "Thank you for confirming your subscription! 🎉\n" +
                        "You’ll now receive updates from us.\n\n" +
                        "Regards,\nBionix-HSE Team"
        );
    }

    @Override
    public void sendNewsletter(String subject, String content) {
        List<NewsletterSubscriber> subscribers = subscriberRepository.findAllByConfirmedTrueAndUnsubscribedFalse();

        for (NewsletterSubscriber subscriber : subscribers) {
            String unsubscribeUrl = appProperties.getNewsletter().getUnsubscribeUrl()
                    + "?email=" + subscriber.getEmail();

            String finalContent = content + "\n\n---\n" +
                    "To unsubscribe, click here: " + unsubscribeUrl;

            emailService.sendNewsletter(subject, finalContent);
        }
    }

    @Override
    @Transactional
    public void unsubscribe(String email) {
        NewsletterSubscriber subscriber = subscriberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found."));

        subscriber.setUnsubscribed(true);
        subscriberRepository.save(subscriber);
    }

    @Override
    public List<NewsletterSubscriber> getAllSubscribers() {
        return subscriberRepository.findAll();
    }

    // ======================
    // Private helpers
    // ======================
    private void sendConfirmationEmail(NewsletterSubscriber subscriber) {
        String confirmationUrl = appProperties.getNewsletter().getConfirmationUrl()
                + "?token=" + subscriber.getConfirmationToken();

        String subject = "📩 Confirm your Ecoviron Newsletter Subscription";
        String body = String.format(
                "Hi,\n\nThank you for subscribing to Ecoviron's newsletter! 🎉\n\n" +
                        "Please confirm your subscription by clicking the link below:\n%s\n\n" +
                        "If you didn’t request this, just ignore this email.\n\n" +
                        "Best regards,\nEcoviron Team",
                confirmationUrl
        );

        emailService.sendNewsletter(subject, body);
    }
}
