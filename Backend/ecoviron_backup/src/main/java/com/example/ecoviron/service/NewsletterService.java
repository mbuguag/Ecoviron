package com.example.ecoviron.service;

import com.example.ecoviron.entity.NewsletterSubscriber;

import java.util.List;

public interface NewsletterService {
    void subscribe(String email);
    void confirmSubscription(String token);
    void sendNewsletter(String subject, String content);
    void unsubscribe(String email);
    List<NewsletterSubscriber> getAllSubscribers();
}
