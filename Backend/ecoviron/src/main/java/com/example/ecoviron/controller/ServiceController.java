package com.example.ecoviron.controller;

import com.example.ecoviron.dto.ServiceRequest;
import com.example.ecoviron.entity.ServiceEntity;
import com.example.ecoviron.service.EnvironmentalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;


@RestController
@RequestMapping("/api/services")
@CrossOrigin
public class ServiceController  {

    private  final EnvironmentalService environmentalService;

    public ServiceController(EnvironmentalService environmentalService) {
        this.environmentalService = environmentalService;
    }

    @GetMapping
    public List<ServiceEntity> getAllServices(){
        return environmentalService.getAllServices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceEntity> getServiceById(@PathVariable Long id) {
        ServiceEntity service = environmentalService.getServiceById(id);
        if (service != null) {
            return ResponseEntity.ok(service);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ServiceEntity> addService(@RequestBody ServiceRequest request){
      ServiceEntity newService =  environmentalService.createService(request);
      return ResponseEntity.created(URI.create("/api/services" + newService.getId())).body(newService);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceEntity> updateService(@PathVariable Long id, @RequestBody ServiceRequest request) {
        ServiceEntity updatedService = environmentalService.updateService(id, request);
        if (updatedService != null) {
            return ResponseEntity.ok(updatedService);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE - delete service
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        boolean deleted = environmentalService.deleteService(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
