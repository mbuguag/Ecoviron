package com.example.ecoviron.service;

import com.example.ecoviron.entity.ContactMessage;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.OrderItem;
import com.example.ecoviron.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Value("${app.reset-password.base-url:http://localhost:5500/frontend/auth/reset-password.html}")
    private String resetPasswordBaseUrl;

    @Value("${admin.email}")
    private String adminEmail;


    /**
     * Sends admin a notification when a contact form is submitted
     */
    public void sendAdminNotification(ContactMessage message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo("mbuguajoseph481@gmail.com");
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

    public void sendOrderNotification(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(adminEmail);
            helper.setFrom(sender);
            helper.setSubject("🛒 New Order Received – " + order.getOrderReference());

            StringBuilder html = new StringBuilder();

            html.append("""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h2 style="color: #2e8b57;">🌿 Bionix-EHS  – New Order Notification</h2>
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
                    order.getOrderDate().toString(),
                    order.getTotalAmount(),
                    order.getStatus(),
                    order.getShippingAddress() == null ? "N/A" : order.getShippingAddress()
            ));

            // Items
            for (OrderItem item : order.getItems()) {
                html.append(String.format("""
              <tr>
                <td>%s</td>
                <td align="center">%d</td>
                <td align="right">%.2f</td>
              </tr>
            """, item.getProduct().getName(), item.getQuantity(), item.getPrice()));
            }

            html.append("""
                </tbody>
              </table>

              <p style="margin-top: 40px; font-size: 14px; color: #555;">
                Please log in to the admin dashboard to manage this order.<br>
                <a href="http://localhost:5500/frontend/admin/admin-dashboard.html" style="color: #2e8b57;">View in Dashboard</a>
              </p>

              <hr style="margin: 30px 0;">
              <p style="font-size: 12px; color: #888888; text-align: center;">
                © %d Bionix-EHS. All rights reserved.
              </p>
            </div>
          </body>
        </html>
        """.formatted(LocalDateTime.now().getYear()));

            helper.setText(html.toString(), true); // HTML email
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send order email to admin", e);
        }
    }


    public void sendCustomerOrderReceiptHtml(Order order, User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(user.getEmail());
            helper.setFrom(sender);
            helper.setSubject("🧾 Your Bionix Order Receipt - " + order.getOrderReference());

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html><body style='font-family: Arial, sans-serif;'>");
            html.append("<h2 style='color: #2c3e50;'>Thanks for your order, ").append(user.getFullName()).append("!</h2>");
            html.append("<p>Here are your order details:</p>");

            html.append("<table style='border-collapse: collapse; width: 100%; margin-top: 10px;'>");
            html.append("<tr><td><strong>Order Reference:</strong></td><td>").append(order.getOrderReference()).append("</td></tr>");
            html.append("<tr><td><strong>Order Date:</strong></td><td>").append(order.getOrderDate()).append("</td></tr>");
            html.append("<tr><td><strong>Status:</strong></td><td>").append(order.getStatus()).append("</td></tr>");
            html.append("<tr><td><strong>Shipping Address:</strong></td><td>").append(order.getShippingAddress()).append("</td></tr>");
            html.append("</table>");

            html.append("<h3 style='margin-top: 20px;'>Items</h3>");
            html.append("<table style='width:100%; border: 1px solid #ddd;'>");
            html.append("<tr style='background-color:#f2f2f2;'>")
                    .append("<th style='padding:8px;border:1px solid #ddd;'>Product</th>")
                    .append("<th style='padding:8px;border:1px solid #ddd;'>Qty</th>")
                    .append("<th style='padding:8px;border:1px solid #ddd;'>Price</th>")
                    .append("</tr>");

            for (OrderItem item : order.getItems()) {
                html.append("<tr>")
                        .append("<td style='padding:8px;border:1px solid #ddd;'>").append(item.getProduct().getName()).append("</td>")
                        .append("<td style='padding:8px;border:1px solid #ddd;'>").append(item.getQuantity()).append("</td>")
                        .append("<td style='padding:8px;border:1px solid #ddd;'>KES ").append(item.getPrice()).append("</td>")
                        .append("</tr>");
            }

            html.append("</table>");
            html.append("<p style='margin-top:10px;'><strong>Total Amount:</strong> KES ").append(order.getTotalAmount()).append("</p>");

            html.append("<p>We'll notify you once your order is shipped.</p>");
            html.append("<p>Best regards,<br/><strong>Ecoviron Team 🌱</strong></p>");
            html.append("</body></html>");

            helper.setText(html.toString(), true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML order receipt", e);
        }
    }

    /**
     * Sends a confirmation email to the user who submitted the contact form.
     */
    public void sendContactConfirmation(ContactMessage message) {
        SimpleMailMessage confirmation = new SimpleMailMessage();
        confirmation.setTo(message.getEmail());
        confirmation.setFrom(sender);
        confirmation.setSubject("We’ve received your message - Bionix-HSE");
        confirmation.setText("""
            Dear %s,

            Thank you for reaching out to Bionix-HSE Environmental Consultancy.
            We have received your message and our team will get back to you shortly.

            Your Message:
            "%s"

            If this was sent in error, feel free to ignore this email.


            Best regards,
            Bionix-HSE Team 🌱
            """.formatted(message.getName(), message.getMessage()));

        mailSender.send(confirmation);
    }

}
