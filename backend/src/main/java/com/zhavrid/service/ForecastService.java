package com.zhavrid.service;

import com.zhavrid.dto.ForecastDto;
import com.zhavrid.model.Forecast;
import com.zhavrid.model.Product;
import com.zhavrid.model.Promotion;
import com.zhavrid.repo.ForecastRepository;
import com.zhavrid.repo.ProductRepository;
import com.zhavrid.repo.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForecastService {

        @Autowired
        private ForecastRepository forecastRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private PromotionRepository promotionRepository;

    private ForecastDto convertToDto(Forecast forecast) {
        ForecastDto dto = new ForecastDto();
        dto.setId(forecast.getId());
        dto.setProductId(forecast.getProductId());
        dto.setDate(forecast.getDate());
        dto.setForecastQuantity(forecast.getForecastQty());
        dto.setModelName(forecast.getModelName());
        Product product = productRepository.findById(forecast.getProductId()).orElse(null);
        if (product != null) {
            dto.setProductName(product.getName());
        }
        if (forecast.getPromoId() != null) {
            Promotion promo = promotionRepository.findById(forecast.getPromoId()).orElse(null);
            if (promo != null) {
                dto.setPromotionName(promo.getName());
            }
        }

        return dto;
    }

        public List<ForecastDto> getAllForecasts() {
            List<Forecast> forecasts = forecastRepository.findAll();
            return forecasts.stream().map(forecast -> {
                ForecastDto dto = new ForecastDto();
                dto.setId(forecast.getId());
                dto.setProductId(forecast.getProductId());
                dto.setDate(forecast.getDate());
                dto.setForecastQuantity(forecast.getForecastQty());
                dto.setModelName(forecast.getModelName());

                Product product = productRepository.findById(forecast.getProductId()).orElse(null);
                if (product != null) {
                    dto.setProductName(product.getName());
                }

                if (forecast.getPromoId() != null) {
                    Promotion promo = promotionRepository.findById(forecast.getPromoId()).orElse(null);
                    if (promo != null) {
                        dto.setPromotionName(promo.getName());
                    }
                }

                return dto;
            }).collect(Collectors.toList());
        }

    public List<ForecastDto> getLatestForecastsByUser(Long userId) {
        Date latestDate = forecastRepository.findMaxCreatedAtByCreatedBy(userId);

        if (latestDate == null) {
            return Collections.emptyList();
        }
        return forecastRepository.findAllByCreatedByAndCreatedAt(userId, latestDate)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    }

