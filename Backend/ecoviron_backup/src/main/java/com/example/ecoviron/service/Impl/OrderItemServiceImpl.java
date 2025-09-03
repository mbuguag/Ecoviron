package com.example.ecoviron.service.Impl;

import com.example.ecoviron.repository.OrderItemRepository;
import com.example.ecoviron.service.OrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl  implements OrderItemService {
    private final OrderItemRepository orderItemRepository;

    @Override
    public long countOrdersForProduct(Long productId) {
        return orderItemRepository.countByProductId(productId);
    }
}
