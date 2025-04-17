package com.zhavrid.dto;

import java.time.LocalDate;
import java.util.Date;

public class ForecastDto {
    private String id;
    private String productId;
    private String productName;
    private Date date;
    private Long forecastQuantity;
    private String modelName;
    private String promotionName;
    private String promoId;

    public String getPromoId() {
        return promoId;
    }

    public void setPromoId(String promoId) {
        this.promoId = promoId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Long getForecastQuantity() {
        return forecastQuantity;
    }

    public void setForecastQuantity(Long forecastQuantity) {
        this.forecastQuantity = forecastQuantity;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getPromotionName() {
        return promotionName;
    }

    public void setPromotionName(String promotionName) {
        this.promotionName = promotionName;
    }
}
