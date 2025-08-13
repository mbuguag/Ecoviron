package com.example.ecoviron.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cartItems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    private int quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    private Cart cart;

}
