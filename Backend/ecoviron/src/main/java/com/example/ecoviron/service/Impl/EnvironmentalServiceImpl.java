package com.example.ecoviron.service.Impl;

import com.example.ecoviron.dto.ServiceRequest;
import com.example.ecoviron.entity.ServiceEntity;
import com.example.ecoviron.repository.ServiceRepository;
import com.example.ecoviron.service.EnvironmentalService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnvironmentalServiceImpl implements EnvironmentalService {

    private final ServiceRepository serviceRepository;

    public EnvironmentalServiceImpl(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    @Override
    public ServiceEntity getServiceById(Long id) {
        return serviceRepository.findById(id).orElse(null);
    }

    @Override
    public ServiceEntity createService(ServiceRequest request) {
        ServiceEntity service = new ServiceEntity();
        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setImageUrl(request.getImageUrl());
        service.setLink(request.getLink());
        return serviceRepository.save(service);
    }

    @Override
    public ServiceEntity updateService(Long id, ServiceRequest request) {
        Optional<ServiceEntity> existing = serviceRepository.findById(id);
        if (existing.isPresent()) {
            ServiceEntity service = existing.get();
            service.setTitle(request.getTitle());
            service.setDescription(request.getDescription());
            service.setImageUrl(request.getImageUrl());
            service.setLink(request.getLink());
            return serviceRepository.save(service);
        }
        return null;
    }

    @Override
    public boolean deleteService(Long id) {
        if (serviceRepository.existsById(id)) {
            serviceRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
