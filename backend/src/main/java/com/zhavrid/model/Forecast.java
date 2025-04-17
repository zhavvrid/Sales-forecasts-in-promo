package com.zhavrid.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "forecasts")
public class Forecast {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "product_id", nullable = false, length = 255)
    private String productId;

    @Column(name = "date")
    private Date date;

    @Column(name = "forecast_qty")
    private Long forecastQty;

    @Column(name = "promo_id", insertable = false, updatable = false)
    private String promoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_id")
    private Promotion promotion;

    @Column(name = "model_name", length = 255)
    private String modelName;

    @Column(name = "created_at")
    private Date createdAt;

    @Column(name = "created_by")
    private Long createdBy;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false) // Связь с продуктом
    private Product product;

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

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Long getForecastQty() {
        return forecastQty;
    }

    public void setForecastQty(Long forecastQty) {
        this.forecastQty = forecastQty;
    }

    public String getPromoId() {
        return promoId;
    }

    public void setPromoId(String promoId) {
        this.promoId = promoId;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

}
