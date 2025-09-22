package com.example.ecoviron.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MpesaPaymentResponseDto {
    @JsonProperty("MerchantRequestID")
    private String merchantRequestId;

    @JsonProperty("CheckoutRequestID")
    private String checkoutRequestId;

    @JsonProperty("ResponseCode")
    private String responseCode;

    @JsonProperty("ResponseDescription")
    private String responseDescription;

    @JsonProperty("CustomerMessage")
    private String customerMessage;
}
