package com.example.ecoviron.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddToCartRequest {
    @NotNull
    public Long productId;

    @Min(1)
    public int quantity;
}
