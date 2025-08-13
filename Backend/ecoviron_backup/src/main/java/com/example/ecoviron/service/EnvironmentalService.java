package com.example.ecoviron.service;

import com.example.ecoviron.dto.ServiceRequest;
import com.example.ecoviron.entity.ServiceEntity;

import java.util.List;

public interface EnvironmentalService {
    List<ServiceEntity> getAllServices();

    ServiceEntity getServiceById(Long id);

    ServiceEntity createService(ServiceRequest request);

    ServiceEntity updateService(Long id, ServiceRequest request);

    boolean deleteService(Long id);
}
