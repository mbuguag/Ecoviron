package com.example.ecoviron.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

<<<<<<< HEAD
@Data
@Setter
@Getter
=======
@Setter
@Getter
@Data
@AllArgsConstructor
>>>>>>> adb88c07e96af384ead270aec16b15f1a20db29b
public class PagedResponse<T> {
    // Getters and Setters
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

}
