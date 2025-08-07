package com.example.ecoviron.repository;

import com.example.ecoviron.entity.BlogPost;
import com.example.ecoviron.entity.BlogPost.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    // Basic status-based queries
    List<BlogPost> findByStatus(PostStatus status);
    Page<BlogPost> findByStatus(PostStatus status, Pageable pageable);
    Optional<BlogPost> findBySlug(String slug);

    Optional<BlogPost> findByIdAndStatus(Long id, PostStatus status);


    boolean existsBySlug(String slug);



    // Search published posts by title or content
    Page<BlogPost> findByStatusAndTitleContainingIgnoreCaseOrStatusAndContentContainingIgnoreCase(
            PostStatus status1, String titleKeyword,
            PostStatus status2, String contentKeyword,
            Pageable pageable
    );

    @Query("SELECT DISTINCT t FROM BlogPost p JOIN p.tags t")
    List<String> findAllTags();

    // Search functionality with improved query
    @Query("SELECT p FROM BlogPost p WHERE " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.snippet) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "p.status = 'PUBLISHED'")
    Page<BlogPost> searchPublishedPosts(@Param("query") String query, Pageable pageable);

    // Tag-related queries
    @Query("SELECT DISTINCT t FROM BlogPost p JOIN p.tags t WHERE p.status = 'PUBLISHED'")
    Set<String> findAllPublishedUniqueTags();

    @Query("SELECT p FROM BlogPost p JOIN p.tags t WHERE t = :tag AND p.status = 'PUBLISHED'")
    Page<BlogPost> findByPublishedTag(@Param("tag") String tag, Pageable pageable);

    // Author-based queries
    Page<BlogPost> findByAuthorIdAndStatus(Long authorId, PostStatus status, Pageable pageable);

    // View count increment (example of modifying query)
    @Modifying
    @Query("UPDATE BlogPost b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);


    // Recent posts query
    @Query("SELECT p FROM BlogPost p WHERE p.status = 'PUBLISHED' ORDER BY p.publishedAt DESC")
    List<BlogPost> findRecentPublishedPosts(Pageable pageable);

    // Archive by year/month
    @Query("SELECT DISTINCT YEAR(p.publishedAt) as year FROM BlogPost p WHERE p.status = 'PUBLISHED'")
    List<Integer> findPublishedYears();

    @Query("SELECT p FROM BlogPost p WHERE YEAR(p.publishedAt) = :year AND MONTH(p.publishedAt) = :month AND p.status = 'PUBLISHED'")
    Page<BlogPost> findByPublishedYearAndMonth(@Param("year") int year, @Param("month") int month, Pageable pageable);

}