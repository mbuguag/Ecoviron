package com.example.ecoviron.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "`order`")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime orderDate;

    private String orderReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    private double totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

<<<<<<< HEAD
    private String orderReference;
=======
    @OneToMany(mappedBy = "order")
    private List<Payment> payments;
>>>>>>> 0adeff7a2bbf24d66d8ba480a90d3600e36c7eeb

}
