package com.zhavrid.service;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.zhavrid.model.Product;
import com.zhavrid.model.Promotion;
import com.zhavrid.model.Sale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zhavrid.repo.ProductRepository;
import com.zhavrid.repo.PromotionRepository;
import com.zhavrid.repo.SaleRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;

@Service
public class GoogleSheetsService {

    private static final String APPLICATION_NAME = "ForecastApp";
    private static final String SPREADSHEET_ID = "1-PSMzv8gHb_hyPb0Eaxm8GIS46pdyFpal2VM60S2qAw";
    private static final String RANGE = "Sheet1!A1:K100"; // откуда читаем данные
    private static final String CREDENTIALS_FILE_PATH = "src/main/resources/credentials.json"; // путь до JSON
    @Autowired
    private ProductRepository productRepository;
    @Autowired private PromotionRepository promotionRepository;
    @Autowired private SaleRepository saleRepository;

    public List<List<Object>> readSheetData() throws IOException, GeneralSecurityException {
        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                            new FileInputStream(CREDENTIALS_FILE_PATH))
                    .createScoped(List.of("https://www.googleapis.com/auth/spreadsheets"));

            Sheets sheetsService = new Sheets.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JacksonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName(APPLICATION_NAME)
                    .build();

            ValueRange response = sheetsService.spreadsheets().values()
                    .get(SPREADSHEET_ID, RANGE)
                    .execute();

            return response.getValues();
        } catch (IOException | GeneralSecurityException e) {
            e.printStackTrace();
            throw e;
        }
    }
    public void loadAndSaveSheetData() throws IOException, GeneralSecurityException {
        List<List<Object>> values = readSheetData();

        for (int i = 1; i < values.size(); i++) {
            List<Object> row = values.get(i);
            if (row.size() >= 11) {
                String productName = row.get(1).toString();
                String category = row.get(2).toString();
                BigDecimal price = new BigDecimal(row.get(3).toString());

                String promoName = row.get(7).toString();
                BigDecimal discount = new BigDecimal(row.get(8).toString());
                LocalDate promoStart = LocalDate.parse(row.get(9).toString());
                LocalDate promoEnd = LocalDate.parse(row.get(10).toString());

                LocalDate saleDate = LocalDate.parse(row.get(4).toString());
                int quantity = Integer.parseInt(row.get(5).toString());
                BigDecimal total = new BigDecimal(row.get(6).toString());

                // -- Product
                Product product = productRepository.findByName(productName)
                        .orElseGet(() -> {
                            Product p = new Product(UUID.randomUUID().toString(), productName, category, price);
                            return productRepository.save(p);
                        });

                // -- Promotion
                Promotion promotion = promotionRepository.findByName(promoName)
                        .orElseGet(() -> {
                            Promotion promo = new Promotion(UUID.randomUUID().toString(), promoName, discount, promoStart, promoEnd);
                            return promotionRepository.save(promo);
                        });

                // -- Sale
                Sale sale = new Sale(UUID.randomUUID().toString(), product, saleDate, quantity, total, promotion);
                saleRepository.save(sale);
            } else {
                // Логирование или игнорирование строк с недостаточным количеством данных
                System.out.println("Недостаточно данных в строке: " + row);
            }
        }
    }

    public List<Map<String, Object>> getRawData() {
        List<Map<String, Object>> result = new ArrayList<>();

        List<Sale> sales = saleRepository.findAll();
        for (Sale sale : sales) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", sale.getId());
            row.put("product_name", sale.getProduct().getName());
            row.put("category", sale.getProduct().getCategory());
            row.put("price", sale.getProduct().getPrice());
            row.put("sale_date", sale.getDate());
            row.put("sale_quantity", sale.getQuantity());
            row.put("sale_total", sale.getTotal());

            if (sale.getPromotion() != null) {
                row.put("promo_name", sale.getPromotion().getName());
                row.put("promo_discount", sale.getPromotion().getDiscount());
                row.put("promo_start_date", sale.getPromotion().getStartDate());
                row.put("promo_end_date", sale.getPromotion().getEndDate());
            } else {
                row.put("promo_name", null);
                row.put("promo_discount", null);
                row.put("promo_start_date", null);
                row.put("promo_end_date", null);
            }

            result.add(row);
        }

        return result;
    }

}

