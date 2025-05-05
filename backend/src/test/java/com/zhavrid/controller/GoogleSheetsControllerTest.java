package com.zhavrid.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhavrid.model.Product;
import com.zhavrid.repo.ProductRepository;
import com.zhavrid.repo.PromotionRepository;
import com.zhavrid.repo.SaleRepository;
import com.zhavrid.service.GoogleSheetsService;
import com.zhavrid.service.JWTService;
import com.zhavrid.config.JwtFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.math.BigDecimal;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GoogleSheetsController.class)
@AutoConfigureMockMvc(addFilters = false) // Отключаем JWT фильтр
@Import(GoogleSheetsControllerTest.TestConfig.class)
@ActiveProfiles("test")
public class GoogleSheetsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GoogleSheetsService googleSheetsService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private SaleRepository saleRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId("1");
        testProduct.setName("Milk");
        testProduct.setCategory("Food");
        testProduct.setPrice(new BigDecimal("2.00"));
    }

    @Test
    void testLoadDataFromSheet() throws Exception {
        List<List<Object>> sheetData = Collections.singletonList(
                Collections.singletonList("Test Data")
        );
        when(googleSheetsService.readSheetData()).thenReturn(sheetData);

        mockMvc.perform(get("/google-sheet/load"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0][0]").value("Test Data"));
    }

    @Test
    void testImportDataToDB_Success() throws Exception {
        doNothing().when(googleSheetsService).loadAndSaveSheetData();

        mockMvc.perform(get("/google-sheet/import"))
                .andExpect(status().isOk())
                .andExpect(content().string("Данные успешно загружены в БД из Google Sheets"));
    }

    @Test
    void testGetRawData() throws Exception {
        Map<String, Object> row = new HashMap<>();
        row.put("product_name", "Test Product");
        when(googleSheetsService.getRawData()).thenReturn(Collections.singletonList(row));

        mockMvc.perform(get("/google-sheet/raw-data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].product_name").value("Test Product"));
    }

    @Test
    void testGetAllProducts() throws Exception {
        when(productRepository.findAll()).thenReturn(Collections.singletonList(testProduct));

        mockMvc.perform(get("/google-sheet/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Milk"));
    }

    @Test
    void testDeleteProduct_Success() throws Exception {
        when(productRepository.existsById("1")).thenReturn(true);

        mockMvc.perform(delete("/google-sheet/products/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateProduct_Success() throws Exception {
        Product updatedProduct = new Product();
        updatedProduct.setName("Bread");
        updatedProduct.setPrice(new BigDecimal("1.50"));

        when(productRepository.findById("1")).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);

        mockMvc.perform(put("/google-sheet/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedProduct)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bread"))
                .andExpect(jsonPath("$.price").value(1.50));
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public GoogleSheetsService googleSheetsService() throws GeneralSecurityException, IOException {
            GoogleSheetsService mock = Mockito.mock(GoogleSheetsService.class);
            doNothing().when(mock).loadAndSaveSheetData();
            return mock;
        }

        @Bean
        @Primary
        public ProductRepository productRepository() {
            return Mockito.mock(ProductRepository.class);
        }

        @Bean
        @Primary
        public PromotionRepository promotionRepository() {
            return Mockito.mock(PromotionRepository.class);
        }

        @Bean
        @Primary
        public SaleRepository saleRepository() {
            return Mockito.mock(SaleRepository.class);
        }

        @Bean
        @Primary
        public JWTService jwtService() {
            return Mockito.mock(JWTService.class);
        }

        @Bean
        @Primary
        public JwtFilter jwtFilter() {
            return Mockito.mock(JwtFilter.class);
        }
    }
}