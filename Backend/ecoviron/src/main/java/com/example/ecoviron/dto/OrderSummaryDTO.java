package com.example.ecoviron.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Data
public class OrderSummaryDTO {
    private long pending;
    private long delivered;

    public OrderSummaryDTO(long pending, long delivered) {
        this.pending = pending;
        this.delivered = delivered;
    }

}
