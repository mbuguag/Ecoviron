package com.example.ecoviron.service.Impl;

import com.example.ecoviron.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${upload.base-path}")
    private String basePath;

    @Override
    public String saveFile(MultipartFile file, String subDir) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        Path dirPath = Paths.get(basePath, subDir);
        Files.createDirectories(dirPath);

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = dirPath.resolve(filename);
        file.transferTo(filePath.toFile());

        return "/uploads/" + subDir + "/" + filename;
    }
}
