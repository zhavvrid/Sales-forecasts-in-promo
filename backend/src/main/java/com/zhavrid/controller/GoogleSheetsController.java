package com.zhavrid.controller;

import com.zhavrid.model.Product;
import com.zhavrid.model.Sale;
import com.zhavrid.model.Promotion;
import com.zhavrid.service.GoogleSheetsService;
import com.zhavrid.repo.ProductRepository;
import com.zhavrid.repo.PromotionRepository;
import com.zhavrid.repo.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/google-sheet")
public class GoogleSheetsController {

    @Autowired
    private GoogleSheetsService googleSheetsService;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private PromotionRepository promotionRepository;
    @Autowired
    private SaleRepository saleRepository;

    @GetMapping("/load")
    public List<List<Object>> loadDataFromSheet() throws IOException, GeneralSecurityException {
        return googleSheetsService.readSheetData();
    }

    @GetMapping("/import")
    public ResponseEntity<String> importDataToDB() {
        try {
            googleSheetsService.loadAndSaveSheetData();
            return ResponseEntity.ok("Данные успешно загружены в БД из Google Sheets");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка: " + e.getMessage());
        }
    }

    @GetMapping("/raw-data")
    public List<Map<String, Object>> getRawData() {
        return googleSheetsService.getRawData();
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/sales")
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @GetMapping("/promotions")
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        try {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении продукта");
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setPrice(productDetails.getPrice());
                    product.setCategory(productDetails.getCategory());
                    Product updatedProduct = productRepository.save(product);
                    return ResponseEntity.ok(updatedProduct);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/sales/{id}")
    public ResponseEntity<?> deleteSale(@PathVariable String id) {
        try {
            saleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении продажи");
        }
    }

    @PutMapping("/sales/{id}")
    public ResponseEntity<Sale> updateSale(@PathVariable String id, @RequestBody Sale saleDetails) {
        return saleRepository.findById(id)
                .map(sale -> {
                    sale.setDate(saleDetails.getDate());
                    sale.setQuantity(saleDetails.getQuantity());
                    sale.setTotal(saleDetails.getTotal());
                    sale.setProduct(saleDetails.getProduct());
                    sale.setPromo(saleDetails.getPromo());
                    Sale updatedSale = saleRepository.save(sale);
                    return ResponseEntity.ok(updatedSale);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable String id) {
        try {
            promotionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении акции");
        }
    }

    @PutMapping("/promotions/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable String id, @RequestBody Promotion promotionDetails) {
        return promotionRepository.findById(id)
                .map(promo -> {
                    promo.setName(promotionDetails.getName());
                    promo.setDiscount(promotionDetails.getDiscount());
                    promo.setStartDate(promotionDetails.getStartDate());
                    promo.setEndDate(promotionDetails.getEndDate());
                    Promotion updatedPromo = promotionRepository.save(promo);
                    return ResponseEntity.ok(updatedPromo);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
