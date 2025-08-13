package com.example.ecoviron.repository;

import com.example.ecoviron.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    Optional<NewsletterSubscriber> findByEmail(String email);
    Optional<NewsletterSubscriber> findByConfirmationToken(String token);
    List<NewsletterSubscriber> findAllByConfirmedTrueAndUnsubscribedFalse();

}
