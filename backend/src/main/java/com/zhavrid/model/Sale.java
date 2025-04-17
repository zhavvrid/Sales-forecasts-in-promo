package com.zhavrid.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private LocalDate date;

    private int quantity;

    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "promo_id")
    private Promotion promo;

    public Promotion getPromotion() {
        return promo;
    }

    public Sale() {}

    public Sale(String id, Product product, LocalDate date, int quantity, BigDecimal total, Promotion promo) {
        this.id = id;
        this.product = product;
        this.date = date;
        this.quantity = quantity;
        this.total = total;
        this.promo = promo;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Promotion getPromo() {
        return promo;
    }

    public void setPromo(Promotion promo) {
        this.promo = promo;
    }
}
