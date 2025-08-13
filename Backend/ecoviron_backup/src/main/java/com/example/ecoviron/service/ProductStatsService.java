package com.example.ecoviron.service;

import com.example.ecoviron.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductStatsService {
    private final OrderItemRepository orderItemRepository;

    public long getOrderCountForProduct(Long productId) {
        return orderItemRepository.countByProductId(productId);
    }
}
