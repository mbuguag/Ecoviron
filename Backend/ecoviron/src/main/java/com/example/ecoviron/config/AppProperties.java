package com.example.ecoviron.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Centralized application properties for URLs, admin, mail and newsletter.
 *
 * Usage:
 *  - app.base-url -> app.getBaseUrl()
 *  - app.reset.password-url -> app.getReset().getPasswordUrl()
 *  - app.admin.email -> app.getAdmin().getEmail()
 *  - app.mail.from -> app.getMail().getFrom()
 *  - app.newsletter.confirmation-url -> app.getNewsletter().getConfirmationUrl()
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /**
     * Example: https://www.bionix-hse.co.ke or http://localhost:5500
     */
    private String baseUrl;

    private Reset reset = new Reset();
    private Admin admin = new Admin();
    private Mail mail = new Mail();
    private Newsletter newsletter = new Newsletter();

    @Getter
    @Setter
    public static class Reset {
        /**
         * URL used for password reset links
         * e.g. https://yourdomain.com/auth/reset-password or http://localhost:5500/frontend/auth/reset-password.html
         */
        private String passwordUrl;
    }

    @Getter
    @Setter
    public static class Admin {
        private String email;
        /**
         * URL pointing to admin dashboard base (we'll append /admin or similar in EmailService)
         * e.g. https://yourdomain.com/admin
         */
        private String dashboardUrl;
    }

    @Getter
    @Setter
    public static class Mail {
        /**
         * Sender/From address used in outgoing mail. Preferably same as spring.mail.username.
         * e.g. noreply@yourdomain.com or yourgmail@gmail.com
         */
        private String from;
        /**
         * Optional reply-to address
         */
        private String replyTo;
    }

    @Getter
    @Setter
    public static class Newsletter {
        private String confirmationUrl;
        private String unsubscribeUrl;
    }
}
