package com.example.ecoviron.controller;

import com.example.ecoviron.entity.Order;
import com.example.ecoviron.entity.User;
import com.example.ecoviron.service.OrderService;
import com.example.ecoviron.util.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public Order checkout(@RequestHeader("Authorization") String token) {
        User user = UserUtil.getUserFromToken(token);
        return orderService.placeOrder(user);
    }
}
