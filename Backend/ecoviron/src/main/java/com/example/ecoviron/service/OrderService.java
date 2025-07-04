package com.example.ecoviron.service;

import com.example.ecoviron.dto.OrderRequestDto;
import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.User;
import java.util.List;

public interface OrderService {

    Order placeOrder(User user);

    List<Order> getAllOrders();


    List<Order> getOrdersByUser(User user);


    Order save(OrderRequestDto orderDto, User user);


}

