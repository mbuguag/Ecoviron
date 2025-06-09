package com.example.ecoviron.controller;


import com.example.ecoviron.entity.User;
import com.example.ecoviron.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class UserTestController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public User getLoggedInUser(){
        return userService.getCurrentUser();
    }
}
