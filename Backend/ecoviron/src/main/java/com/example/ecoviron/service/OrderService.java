package com.example.ecoviron.service;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.User;

public interface OrderService {
    Order placeOrder(User user);
}
