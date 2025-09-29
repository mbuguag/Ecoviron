package com.example.ecoviron.service;

import com.example.ecoviron.config.AppProperties;
import com.example.ecoviron.entity.ContactMessage;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderItem;
import com.example.ecoviron.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * EmailService uses AppProperties for all env-driven values (URLs, admin email, sender).
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    private String getSender() {
        // Prefer app.mail.from; if not set, fallback to spring.mail.username (configured in spring).
        String from = appProperties.getMail().getFrom();
        return (from == null || from.isBlank()) ? "" : from;
    }

    // ---------------- Admin notifications ----------------

    public void sendAdminNotification(ContactMessage message) {
        String sender = getSender();
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(appProperties.getAdmin().getEmail());
        if (!sender.isBlank()) mail.setFrom(sender);
        if (appProperties.getMail().getReplyTo() != null) mail.setReplyTo(appProperties.getMail().getReplyTo());

        mail.setSubject("New Contact Message from " + message.getName());
        mail.setText("""
                Name: %s
                Email: %s
                Phone: %s

                Message:
                %s
                """.formatted(message.getName(), message.getEmail(), message.getPhone(), message.getMessage())
        );

        mailSender.send(mail);
    }

    // ---------------- Password reset ----------------

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetBase = appProperties.getReset().getPasswordUrl();
        if (resetBase == null || resetBase.isBlank()) {
            // fallback to app.baseUrl + default path
            resetBase = appProperties.getBaseUrl() + "/auth/reset-password";
        }
        String resetLink = resetBase + (resetBase.contains("?") ? "&" : "?") + "token=" + resetToken;

        String subject = "Reset Your Password - BIONIX-HSE";
        String body = """
                Hi,

                We received a request to reset your password. Click the link below to proceed:
                %s

                If you did not request this, please ignore this email.

                Best regards,
                BIONIX-HSE Team
                """.formatted(resetLink);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(toEmail);
        if (!getSender().isBlank()) mail.setFrom(getSender());
        mail.setSubject(subject);
        mail.setText(body);

        mailSender.send(mail);
    }

    // ---------------- Order notifications (admin) ----------------

    public void sendOrderNotification(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String adminEmail = appProperties.getAdmin().getEmail();
            if (adminEmail == null || adminEmail.isBlank()) {
                throw new IllegalStateException("Admin email not configured (app.admin.email)");
            }

            helper.setTo(adminEmail);
            if (!getSender().isBlank()) helper.setFrom(getSender());
            if (appProperties.getMail().getReplyTo() != null) helper.setReplyTo(appProperties.getMail().getReplyTo());
            helper.setSubject("🛒 New Order Received – " + order.getOrderReference());

            StringBuilder html = new StringBuilder();
            html.append("""
                    <html>
                      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                          <h2 style="color: #2e8b57;">🌿 BIONIX_HSE – New Order Notification</h2>
                          <p><strong>Customer:</strong> %s (%s)</p>
                          <p><strong>Order Reference:</strong> %s</p>
                          <p><strong>Date:</strong> %s</p>
                          <p><strong>Total:</strong> <strong>KES %.2f</strong></p>
                          <p><strong>Status:</strong> %s</p>
                          <p><strong>Shipping Address:</strong> %s</p>

                          <h3 style="margin-top: 30px;">🛍 Order Items</h3>
                          <table width="100%%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                            <thead>
                              <tr style="background-color: #f0f0f0;">
                                <th align="left">Product</th>
                                <th align="center">Qty</th>
                                <th align="right">Price (KES)</th>
                              </tr>
                            </thead>
                            <tbody>
                    """.formatted(
                    user.getFullName(), user.getEmail(),
                    order.getOrderReference(),
                    order.getOrderDate(),
                    order.getTotalAmount(),
                    order.getStatus(),
                    order.getShippingAddress() == null ? "N/A" : order.getShippingAddress()
            ));

            for (OrderItem item : order.getItems()) {
                html.append(String.format("""
                          <tr>
                            <td>%s</td>
                            <td align="center">%d</td>
                            <td align="right">%.2f</td>
                          </tr>
                        """, item.getProduct().getName(), item.getQuantity(), item.getPrice()));
            }

            String dashboard = appProperties.getAdmin().getDashboardUrl();
            if (dashboard == null || dashboard.isBlank()) {
                dashboard = appProperties.getBaseUrl() + "/admin";
            }
            html.append("""
                            </tbody>
                          </table>
                          <p style="margin-top: 40px; font-size: 14px; color: #555;">
                            Please log in to the admin dashboard to manage this order.<br>
                            <a href="%s" style="color: #2e8b57;">View in Dashboard</a>
                          </p>

                          <hr style="margin: 30px 0;">
                          <p style="font-size: 12px; color: #888888; text-align: center;">
                            © %d BIONIX-HSE. All rights reserved.
                          </p>
                        </div>
                      </body>
                    </html>
                    """.formatted(dashboard, LocalDateTime.now().getYear()));

            helper.setText(html.toString(), true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send order email to admin", e);
        }
    }

    // ---------------- Customer receipt ----------------

    public void sendCustomerOrderReceiptHtml(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            if (!getSender().isBlank()) helper.setFrom(getSender());
            helper.setSubject("🧾 Order Receipt - " + order.getOrderReference());

            String orderUrlBase = appProperties.getBaseUrl();
            if (orderUrlBase == null || orderUrlBase.isBlank()) orderUrlBase = "";

            String html = """
                    <html>
                      <body style="font-family: Arial, sans-serif;">
                        <h2>Thank you for your order, %s!</h2>
                        <p>Your order reference is: <strong>%s</strong></p>
                        <p>Total amount: KES %.2f</p>
                        <p>Status: %s</p>
                        <p>You can view your order details here: <a href="%s/orders/%s">%s/orders/%s</a></p>
                        <p>Best regards,<br/><strong>BIONIX-HSE Team 🌱</strong></p>
                      </body>
                    </html>
                    """.formatted(
                    user.getFullName(),
                    order.getOrderReference(),
                    order.getTotalAmount(),
                    order.getStatus(),
                    orderUrlBase, order.getOrderReference(),
                    orderUrlBase, order.getOrderReference()
            );

            helper.setText(html, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send order receipt email to customer", e);
        }
    }

    // ---------------- Contact confirmation ----------------

    public void sendContactConfirmation(ContactMessage contactMessage) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(contactMessage.getEmail());
        if (!getSender().isBlank()) mail.setFrom(getSender());
        mail.setSubject("📩 We’ve received your message – BIONIX-HSE");
        mail.setText("""
                Hi %s,

                Thank you for reaching out to us. We’ve received your message and our team will get back to you soon.

                Best,
                BIONIX-HSE Support Team
                """.formatted(contactMessage.getName()));

        mailSender.send(mail);
    }

    // ---------------- Payment failure ----------------

    public void sendPaymentFailedEmail(Order order, User user, String reason) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        if (!getSender().isBlank()) mail.setFrom(getSender());
        mail.setSubject("⚠ Payment Failed - " + order.getOrderReference());
        mail.setText("""
                Hi %s,

                Unfortunately, your payment for order %s failed.
                Reason: %s

                Please try again or contact support.

                Regards,
                Bionix-HSE Team
                """.formatted(user.getFullName(), order.getOrderReference(), reason));

        mailSender.send(mail);
    }

    // ---------------- Newsletter ----------------

    public void sendNewsletter(String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = getSender();
            if (!sender.isBlank()) helper.setFrom(sender);

            helper.setSubject(subject);
            helper.setText(body, false); // plain text

            // NOTE: Recipient must be set by the caller,
            // so this is intended for single-subscriber use.
            // If you want multi-subscriber broadcast, wrap this in NewsletterServiceImpl.

            throw new UnsupportedOperationException("Recipient email must be set by caller");

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send newsletter", e);
        }
    }

}
