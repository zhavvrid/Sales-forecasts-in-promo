package com.zhavrid.controller;
import com.zhavrid.model.Product;
import com.zhavrid.model.Sale;
import com.zhavrid.model.Promotion;
import com.zhavrid.service.GoogleSheetsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.zhavrid.repo.ProductRepository;
import com.zhavrid.repo.PromotionRepository;
import com.zhavrid.repo.SaleRepository;
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

}

