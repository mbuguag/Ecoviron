package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.AboutDTO;
import com.example.ecoviron.entity.About;
import com.example.ecoviron.repository.AboutRepository;
import com.example.ecoviron.service.AboutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AboutServiceImpl implements AboutService {

    private final AboutRepository aboutRepository;


    @Override
    public List<AboutDTO> getAllAboutSections() {
        return aboutRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AboutDTO saveAbout(AboutDTO aboutDTO) {
        About about = mapToEntity(aboutDTO);
        About saved = aboutRepository.save(about);
        return mapToDTO(saved);
    }

    @Override
    public AboutDTO updateAbout(Long id, AboutDTO aboutDTO) {
        About existing = aboutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("About section not found with id " + id));

        existing.setSection(aboutDTO.getSection());
        existing.setContent(aboutDTO.getContent());

        About updated = aboutRepository.save(existing);
        return mapToDTO(updated);
    }

    @Override
    public void deleteAbout(Long id) {
        aboutRepository.deleteById(id);
    }

    private AboutDTO mapToDTO(About about) {
        return AboutDTO.builder()
                .id(about.getId())
                .section(about.getSection())
                .content(about.getContent())
                .build();
    }

    private About mapToEntity(AboutDTO dto) {
        return About.builder()
                .id(dto.getId())
                .section(dto.getSection())
                .content(dto.getContent())
                .build();
    }
}
