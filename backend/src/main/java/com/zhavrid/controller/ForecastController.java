package com.zhavrid.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhavrid.dto.ForecastDto;
import com.zhavrid.model.Product;
import com.zhavrid.model.Users;
import com.zhavrid.repo.ProductRepository;
import com.zhavrid.repo.PromotionRepository;
import com.zhavrid.repo.UserRepo;
import com.zhavrid.service.ForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/forecast")
public class ForecastController {

    @Autowired
    private ForecastService forecastService;
    @Autowired
    private UserRepo userRepository;

    @Autowired
    private ProductRepository  productRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @GetMapping("/latest")
    public ResponseEntity<List<ForecastDto>> getLatestForecasts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(forecastService.getLatestForecastsByUser(user.getId()));
    }
    @PostMapping("/run")
    public ResponseEntity<String> runForecast(@RequestParam(required = false) String productId,
                                              @RequestParam(required = false) String promotionId,
                                              @RequestBody(required = false) Map<String, Object> body) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Users user = userRepository.findByUsername(username);
            if (user == null) throw new RuntimeException("User not found");
            if (promotionId != null && !"none".equals(promotionId)) {
                boolean promoExists = promotionRepository.existsById(promotionId);
                if (!promoExists) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Promotion not found");
                }
            }
            String pythonPath = "C:\\Users\\zhavr\\FlaskProject\\.venv\\Scripts\\python.exe";
            String scriptPath = "C:\\Users\\zhavr\\FlaskProject\\app.py";
            String modelType = body != null ? (String) body.get("modelType") : null;
            Map<String, Object> modelParams = body != null ? (Map<String, Object>) body.get("modelParams") : null;

            List<String> cmdArgs = new ArrayList<>();
            cmdArgs.add(pythonPath);
            cmdArgs.add(scriptPath);
            cmdArgs.add(String.valueOf(user.getId()));
            cmdArgs.add(productId != null ? productId : "all");
            cmdArgs.add(promotionId != null ? promotionId : "none");
            cmdArgs.add(modelType != null ? modelType : "random_forest");

            if (modelParams != null) {
                String jsonParams = new ObjectMapper().writeValueAsString(modelParams);
                jsonParams = jsonParams.replace("\"", "\\\"");  // Экранируем кавычки
                cmdArgs.add("\"" + jsonParams + "\"");
            } else {
                cmdArgs.add("\"{}\"");
            }

            System.out.println("=== Запуск прогноза ===");
            System.out.println("Команда: " + String.join(" ", cmdArgs));
            System.out.println("promotion "+ promotionId);

            if (productId != null && !"all".equals(productId)) {
                Optional<Product> product = productRepository.findById(productId);
                if (product.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Product not found");
                }
            }

            ProcessBuilder pb = new ProcessBuilder(cmdArgs);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            StringBuilder output = new StringBuilder();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    System.out.println("[Python] " + line);
                }
            }

            int exitCode = process.waitFor();
            System.out.println("Выходной код: " + exitCode);

            if (exitCode == 0) {
                return ResponseEntity.ok("Forecast completed successfully\n" + output);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Forecast failed with exit code: " + exitCode + "\nOutput:\n" + output);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Exception occurred: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ForecastDto>> getForecasts() {
        return ResponseEntity.ok(forecastService.getAllForecasts());
    }
}