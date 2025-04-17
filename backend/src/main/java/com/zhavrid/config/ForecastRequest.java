package com.zhavrid.config;

public class ForecastRequest {
    private String modelType;
    private int nEstimators;
    private int maxDepth;
    private double learningRate;

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public int getNEstimators() {
        return nEstimators;
    }

    public void setNEstimators(int nEstimators) {
        this.nEstimators = nEstimators;
    }

    public int getMaxDepth() {
        return maxDepth;
    }

    public void setMaxDepth(int maxDepth) {
        this.maxDepth = maxDepth;
    }

    public double getLearningRate() {
        return learningRate;
    }

    public void setLearningRate(double learningRate) {
        this.learningRate = learningRate;
    }

    @Override
    public String toString() {
        return "ForecastRequest{" +
                "modelType='" + modelType + '\'' +
                ", nEstimators=" + nEstimators +
                ", maxDepth=" + maxDepth +
                ", learningRate=" + learningRate +
                '}';
    }
}
