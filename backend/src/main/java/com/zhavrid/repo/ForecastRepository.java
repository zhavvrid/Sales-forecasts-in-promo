package com.zhavrid.repo;

import com.zhavrid.model.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface ForecastRepository extends JpaRepository<Forecast, String> {

    List<Forecast> findByProductId(String productId);

    List<Forecast> findByProductIdAndDateBetween(String productId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT f FROM Forecast f WHERE f.productId = :productId AND f.date > :date")
    List<Forecast> findFutureForecastsForProduct(@Param("productId") String productId, @Param("date") LocalDate date);

    List<Forecast> findByModelName(String modelName);

    @Query("SELECT f FROM Forecast f WHERE f.product.category = :category")
    List<Forecast> findByCategory(@Param("category") String category);

    @Query("SELECT MAX(f.createdAt) FROM Forecast f WHERE f.createdBy = :userId")
    Date findMaxCreatedAtByCreatedBy(@Param("userId") Long userId);

    List<Forecast> findAllByCreatedByAndCreatedAt(Long createdBy, Date createdAt);
}
