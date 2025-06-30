package com.example.ecoviron.service;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.User;

import java.util.List;

public interface OrderService {
    Order placeOrder(User user);

    List<Order> getAllOrders();

    List<Order> getOrdersByUser(User user);

    Order saveOrder(Order order, User user);
<<<<<<< HEAD
=======

>>>>>>> 0adeff7a2bbf24d66d8ba480a90d3600e36c7eeb
}
