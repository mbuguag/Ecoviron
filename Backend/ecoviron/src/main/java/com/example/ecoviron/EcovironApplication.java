package com.example.ecoviron;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(scanBasePackages = "com.example.ecoviron")
public class EcovironApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcovironApplication.class, args);
	}

}
