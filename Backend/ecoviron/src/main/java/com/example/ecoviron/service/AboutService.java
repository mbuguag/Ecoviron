package com.example.ecoviron.service;

import com.example.ecoviron.dto.AboutDTO;

import java.util.List;

public interface AboutService {
    List<AboutDTO> getAllAboutSections();
    AboutDTO saveAbout(AboutDTO aboutDTO);
    AboutDTO updateAbout(Long id, AboutDTO aboutDTO);
    void deleteAbout(Long id);
}
