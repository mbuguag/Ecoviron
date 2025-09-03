//package com.example.ecoviron.service.Impl;
//
//import com.cloudinary.Cloudinary;
//import com.cloudinary.utils.ObjectUtils;
//import com.example.ecoviron.service.FileStorageService;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Service
//public class CloudinaryStorageServiceImpl implements FileStorageService {
//
//    private final Cloudinary cloudinary;
//
//    public CloudinaryStorageServiceImpl(Cloudinary cloudinary) {
//        this.cloudinary = cloudinary;
//    }
//
//    @Override
//    public String saveFile(MultipartFile file, String subDir) throws IOException {
//        Map uploadResult = cloudinary.uploader().upload(
//                file.getBytes(),
//                ObjectUtils.asMap(
//                        "folder", "ecoviron/" + subDir
//                )
//        );
//        return uploadResult.get("secure_url").toString();
//    }
//}
//
