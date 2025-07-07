package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.QuoteRequestDto;
import com.example.ecoviron.entity.QuoteRequest;
import com.example.ecoviron.repository.QuoteRequestRepository;
import com.example.ecoviron.service.QuoteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuoteRequestServiceImpl implements QuoteRequestService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final JavaMailSender mailSender;

    @Override
    public void handleQuoteRequest(QuoteRequestDto dto) {
        // Save request to the database
        QuoteRequest request = QuoteRequest.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .service(dto.getService())
                .message(dto.getMessage())
                .submittedAt(LocalDateTime.now())
                .build();

        quoteRequestRepository.save(request);

        // === 1. Notify admin/team ===
        SimpleMailMessage adminMessage = new SimpleMailMessage();
        adminMessage.setTo("yourteam@company.com"); // Replace with actual admin email
        adminMessage.setSubject("New Quote Request: " + dto.getService());
        adminMessage.setText("Name: " + dto.getName() +
                "\nEmail: " + dto.getEmail() +
                "\nService: " + dto.getService() +
                "\nMessage: " + dto.getMessage());

        mailSender.send(adminMessage);

        // === 2. Confirm to user ===
        SimpleMailMessage userMessage = new SimpleMailMessage();
        userMessage.setTo(dto.getEmail());
        userMessage.setSubject("We've received your quote request!");

        String userBody = """
                Hi %s,
                
                Thank you for contacting us regarding "%s". 
                We've received your request and our team will reach out to you shortly.
                
                Here's what you submitted:
                %s
                
                – GreenEarth Environmental Consultancy Team
                """.formatted(
                dto.getName(),
                dto.getService(),
                dto.getMessage()
        );

        userMessage.setText(userBody);

        mailSender.send(userMessage);
    }

    @Override
    public List<QuoteRequestDto> getAllRequests() {
        return quoteRequestRepository.findAll().stream()
                .map(q -> QuoteRequestDto.builder()
                        .name(q.getName())
                        .email(q.getEmail())
                        .service(q.getService())
                        .message(q.getMessage())
                        .build())
                .collect(Collectors.toList());
    }
}
