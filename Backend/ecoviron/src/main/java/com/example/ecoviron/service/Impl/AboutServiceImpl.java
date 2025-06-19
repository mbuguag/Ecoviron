package com.example.ecoviron.service.Impl;

import com.example.ecoviron.entity.About;
import com.example.ecoviron.repository.AboutRepository;
import com.example.ecoviron.service.AboutService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AboutServiceImpl implements AboutService {

    private final AboutRepository aboutRepository;

    public AboutServiceImpl(AboutRepository aboutRepository) {
        this.aboutRepository = aboutRepository;
    }

    @Override
    public List<About> getAllAboutSections() {
        return aboutRepository.findAllByOrderByIdAsc();
    }
}
