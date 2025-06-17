package com.example.ecoviron.dto;

public class OrderSummaryDTO {
    private long pending;
    private long delivered;

    public OrderSummaryDTO(long pending, long delivered) {
        this.pending = pending;
        this.delivered = delivered;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getDelivered() {
        return delivered;
    }

    public void setDelivered(long delivered) {
        this.delivered = delivered;
    }
}
