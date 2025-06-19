package com.example.ecoviron.controller;

import com.example.ecoviron.entity.About;
import com.example.ecoviron.service.AboutService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/about")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class AboutController {

    private final AboutService aboutService;

    public AboutController(AboutService aboutService) {
        this.aboutService = aboutService;
    }

    @GetMapping
    public List<About> getAboutContent() {
        System.out.println(">>> GET /api/about calle");
        return aboutService.getAllAboutSections();
    }

}
