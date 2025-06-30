package com.example.ecoviron.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mpesaReceiptNumber;

    private String phoneNumber;

    private double amount;

    private String status; //  "SUCCESS", "FAILED", "PENDING"

    @Temporal(TemporalType.TIMESTAMP)
    private Date transactionDate;

    private String transactionType; // Optional: STK_PUSH, B2C, etc.

    private String orderReference;


    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}