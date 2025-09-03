package com.example.ecoviron.controller;

import com.example.ecoviron.dto.AboutDTO;
import com.example.ecoviron.service.AboutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public List<AboutDTO> getAboutContent() {
        System.out.println(">>> GET /api/about called");
        return aboutService.getAllAboutSections();
    }

    @PostMapping
    public ResponseEntity<AboutDTO> createAbout(@RequestBody AboutDTO aboutDTO) {
        AboutDTO created = aboutService.saveAbout(aboutDTO);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AboutDTO> updateAbout(@PathVariable Long id, @RequestBody AboutDTO aboutDTO) {
        AboutDTO updated = aboutService.updateAbout(id, aboutDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbout(@PathVariable Long id) {
        aboutService.deleteAbout(id);
        return ResponseEntity.noContent().build();
    }
}
