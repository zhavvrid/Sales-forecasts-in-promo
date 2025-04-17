import { useState, useEffect } from 'react';
import axios from "../axiosConfig";
import {
    Button,
    Table,
    Card,
    Select,
    DatePicker,
    Empty,
    message,
    Spin,
    Alert
} from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ForecastPage = () => {
    const [forecasts, setForecasts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [forecastGenerated, setForecastGenerated] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [modelParams, setModelParams] = useState({});
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [promotions, setPromotions] = useState([]);

    const modelParamOptions = {
        'random_forest': ['n_estimators'],
        'gradient_boosting': ['n_estimators', 'learning_rate'],
        'decision_tree': ['max_depth', 'min_samples_split'],
        'linear_regression': []
    };

    useEffect(() => {
        loadInitialData();
        loadForecasts();
        loadPromotions();
    }, []);

    const loadForecasts = async () => {
        try {
            const res = await axios.get('/forecast/latest');
            setForecasts(res.data);
        } catch (error) {
            console.error('Error loading forecasts:', error);
        }
    };

    const loadInitialData = async () => {
        try {
            const res = await axios.get('http://localhost:8080/google-sheet/products');
            setProducts(res.data);
        } catch (error) {
            message.error('Failed to load products');
        }
    };

    const loadPromotions= async () => {
        try {
            const res = await axios.get('http://localhost:8080/google-sheet/promotions');
            setPromotions(res.data);
        } catch (error) {
            message.error('Failed to load promotions');
        }
    };

    const handleModelChange = (model) => {
        setSelectedModel(model);
        setModelParams({});
    };

    const handleParamChange = (param, value) => {
        setModelParams(prevParams => ({
            ...prevParams,
            [param]: value
        }));
    };

    const runForecast = async () => {
        setLoading(true);
        try {
            await axios.post('/forecast/run', {
                modelType: selectedModel,
                modelParams: modelParams
            }, {
                params: {
                    productId: selectedProduct || 'all',
                    promotionId: selectedPromotion
                }
            });

            await loadForecasts();
            setForecastGenerated(true);
            message.success('Forecast generated');
        } catch (error) {
            message.error('Error running forecast');
        } finally {
            setLoading(false);
        }
    };

    const filteredForecasts = forecasts;

    return (
        <div className="p-6">
            <Card
                title="📊 Sales Forecast"
                className="shadow-lg rounded-2xl"
                bodyStyle={{ padding: '24px' }}
                extra={
                    forecastGenerated && (
                        <Alert
                            message="New forecast generated!"
                            type="success"
                            showIcon
                            closable
                        />
                    )
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Select
                        placeholder="Select Model"
                        options={[
                            { value: 'random_forest', label: 'Random Forest' },
                            { value: 'gradient_boosting', label: 'Gradient Boosting' },
                            { value: 'decision_tree', label: 'Decision Tree' },
                            { value: 'linear_regression', label: 'Linear Regression' }
                        ]}
                        value={selectedModel}
                        onChange={handleModelChange}
                        style={{ width: '100%' }}
                    />
                    {
                        modelParamOptions[selectedModel]?.map(param => (
                            <input
                                key={param}
                                type="number"
                                placeholder={param}
                                value={modelParams[param] || ''}
                                onChange={e => handleParamChange(param, e.target.value)}
                            />
                        ))
                    }
                    <Select
                        placeholder="Select Product"
                        options={[
                            { value: 'all', label: 'All Products' },
                            ...products.map(p => ({
                                value: p.id,
                                label: p.name,
                            }))
                        ]}
                        value={selectedProduct}
                        onChange={setSelectedProduct}
                        style={{ width: '100%' }}
                    />
                    <Select
                        placeholder="Select Promotion"
                        options={[
                            { value: 'none', label: 'No Promotion' },
                            ...promotions.map(p => ({
                                value: p.id,
                                label: p.name,
                            }))
                        ]}
                        value={selectedPromotion}
                        onChange={setSelectedPromotion}
                        style={{ width: '100%' }}
                    />
                    <RangePicker
                        style={{ width: '100%' }}
                        value={dateRange}
                        onChange={setDateRange}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        loading={loading}
                        onClick={runForecast}
                        block
                    >
                        Generate Forecast
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Spin size="large" />
                    </div>
                ) : filteredForecasts.length > 0 ? (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table
                            dataSource={filteredForecasts}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            columns={[
                                {
                                    title: 'Product',
                                    dataIndex: 'productName',
                                    sorter: (a, b) => a.productName.localeCompare(b.productName),
                                },
                                {
                                    title: 'Date',
                                    dataIndex: 'date',
                                    render: date => dayjs(date).format('YYYY-MM-DD'),
                                    sorter: (a, b) => new Date(a.date) - new Date(b.date),
                                },
                                {
                                    title: 'Forecast Qty',
                                    dataIndex: 'forecastQuantity',
                                    sorter: (a, b) => a.forecastQuantity - b.forecastQuantity,
                                },
                                {
                                    title: 'Promotion',
                                    dataIndex: 'promotionName',
                                    sorter: (a, b) => a.promotionName?.localeCompare(b.promotionName || '') ?? 0,
                                    render: promo => promo || 'None',
                                },
                            ]}
                        />
                    </div>
                ) : (
                    <Empty description="No forecasts available. Click 'Generate Forecast' to create new predictions." />
                )}
            </Card>
        </div>
    );
};


export default ForecastPage;