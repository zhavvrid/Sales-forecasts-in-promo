import React, { useState, useEffect, useMemo } from 'react';
import axios from "../axiosConfig";
import {
    Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Select, SelectItem, Button, Spinner, Divider, Chip,
    Tabs, Tab, CardBody, CardHeader, CardFooter, Pagination, Input
} from '@nextui-org/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download } from 'lucide-react';
import { ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts';
import { BarList } from '@tremor/react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ForecastAnalysis = () => {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(new Set(['all']));
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(new Set(['all']));
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [activeTab, setActiveTab] = useState('table');
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;


    const filteredForecasts = useMemo(() => {
        return forecasts.filter(forecast => {
            const selectedPromoValue = [...selectedPromotion][0];
            const selectedProductValue = [...selectedProduct][0];

            // Отладочный вывод
            console.log('Filtering - selected promo:', selectedPromoValue,
                'forecast promo:', forecast.promotionName);

            const matchesPromotion =
                selectedPromoValue === 'all' ||
                (selectedPromoValue === 'none' && !forecast.promotionName) ||
                (forecast.promotionName && forecast.promotionName === selectedPromoValue);

            const matchesProduct =
                selectedProductValue === 'all' ||
                forecast.productId === selectedProductValue;

            const forecastDate = new Date(forecast.date);
            const matchesDate =
                (!startDate || forecastDate >= new Date(startDate)) &&
                (!endDate || forecastDate <= new Date(endDate));

            console.log('Matches:', {
                promotion: matchesPromotion,
                product: matchesProduct,
                date: matchesDate
            });

            return matchesPromotion && matchesProduct && matchesDate;
        });
    }, [forecasts, selectedPromotion, selectedProduct, startDate, endDate]);

// Дополнительные функции для подготовки данных
    const preparePromoEffectiveness = () => {
        const promoGroups = {};

        filteredForecasts.forEach(f => {
            const key = f.promotionName || 'No Promotion';
            if (!promoGroups[key]) {
                promoGroups[key] = { sum: 0, count: 0, productIds: new Set() };
            }
            promoGroups[key].sum += f.forecastQuantity;
            promoGroups[key].count++;
            promoGroups[key].productIds.add(f.productId);
        });

        return Object.entries(promoGroups).map(([name, data]) => ({
            name,
            value: data.sum,
            avg: data.sum / data.count,
            productCount: data.productIds.size
        }));
    };

    const prepareProductPerformance = () => {
        const productData = {};

        filteredForecasts.forEach(f => {
            if (!productData[f.productId]) {
                productData[f.productId] = {
                    name: f.productName || f.productId,
                    withPromo: 0,
                    withoutPromo: 0
                };
            }
            if (f.promotionName) {
                productData[f.productId].withPromo += f.forecastQuantity;
            } else {
                productData[f.productId].withoutPromo += f.forecastQuantity;
            }
        });

        return Object.values(productData).map(p => ({
            ...p,
            promoEffect: p.withPromo > 0 ?
                ((p.withPromo - p.withoutPromo) / p.withoutPromo * 100).toFixed(1) + '%' : 'N/A'
        }));
    };

    useEffect(() => {
        loadInitialData();
    }, []);
// Новая функция для расчета статистической значимости
    const calculateStatisticalSignificance = () => {
        const data = preparePromoEffectiveness();
        const noPromo = data.find(p => p.name === 'No Promotion');
        const withPromo = data.filter(p => p.name !== 'No Promotion');

        if (!noPromo || withPromo.length === 0) return null;

        // Простая имитация t-test (в реальном приложении используйте библиотеку)
        const meanWith = withPromo.reduce((sum, p) => sum + p.avg, 0) / withPromo.length;
        const meanWithout = noPromo.avg;
        const stdDev = Math.sqrt(
            [...withPromo.map(p => p.avg), noPromo.avg]
                .reduce((sq, n) => sq + Math.pow(n - meanWith, 2), 0) /
            (withPromo.length + 1)
        );
        const tValue = (meanWith - meanWithout) / (stdDev / Math.sqrt(withPromo.length + 1));

        return {
            tValue: tValue.toFixed(2),
            significance: Math.abs(tValue) > 2 ? 'high' : Math.abs(tValue) > 1 ? 'medium' : 'low'
        };
    };

// Использование в компоненте:
    const stats = calculateStatisticalSignificance();

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [forecastsRes, promotionsRes, productsRes] = await Promise.all([
                axios.get('/forecast'),
                axios.get('/google-sheet/promotions'),
                axios.get('/google-sheet/products')
            ]);

            // Отладочный вывод структуры данных
            console.log("Данные прогнозов с сервера:", forecastsRes.data);
            console.log("Первая запись прогноза:", forecastsRes.data[0]);
            console.log("Ключи первой записи:", Object.keys(forecastsRes.data[0]));

            const forecastsWithDates = forecastsRes.data.map(forecast => {
                console.log("Отдельный прогноз до обработки:", forecast);
                return {
                    ...forecast,
                    date: new Date(forecast.date)
                };
            });

            setForecasts(forecastsWithDates);
            setPromotions(promotionsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };



    // Подготовка данных для графиков с анализом промоакций
    const preparePromoAnalysisData = () => {
        const promoData = {};

        filteredForecasts.forEach(forecast => {
            const promoKey = forecast.promotionName || 'No Promotion';

            if (!promoData[promoKey]) {
                promoData[promoKey] = {
                    name: promoKey,
                    value: 0,
                    count: 0
                };
            }

            promoData[promoKey].value += forecast.forecastQuantity;
            promoData[promoKey].count++;
        });

        return Object.values(promoData);
    };

    const prepareTimeSeriesData = () => {
        const dataByDateAndPromo = {};

        filteredForecasts.forEach(forecast => {
            const dateStr = forecast.date.toISOString().split('T')[0];
            const promoKey = forecast.promotionName || 'No Promotion';

            if (!dataByDateAndPromo[dateStr]) {
                dataByDateAndPromo[dateStr] = { date: dateStr };
            }

            if (!dataByDateAndPromo[dateStr][promoKey]) {
                dataByDateAndPromo[dateStr][promoKey] = 0;
            }

            dataByDateAndPromo[dateStr][promoKey] += forecast.forecastQuantity;
        });

        return Object.values(dataByDateAndPromo).sort((a, b) => new Date(a.date) - new Date(b.date));
    };
    const promoAnalysisData = preparePromoAnalysisData();
    const timeSeriesData = prepareTimeSeriesData();

    const exportData = () => {
        const dataStr = JSON.stringify(filteredForecasts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `forecast-analysis-${new Date().toISOString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="w-full h-full flex flex-row flex-wrap bg-gradient-to-t from-sky-700 to-blue-500">
            <div className="w-4/5 h-full flex flex-col items-center p-4 mx-auto">
                <Card className="p-6 w-full max-w-6xl mt-4">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-xl font-bold">Forecast Sales Analysis</h2>
                        <div className="flex gap-2">
                            <Button color="primary" startContent={<Download />} onPress={exportData}>Export Data</Button>
                            <Button onPress={loadInitialData}>Refresh Data</Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Select
                                label="Select Promotion"
                                selectedKeys={selectedPromotion}
                                onSelectionChange={setSelectedPromotion}
                            >
                                <SelectItem key="all" value="all">All Promotions</SelectItem>
                                <SelectItem key="none" value="none">No Promotion</SelectItem>
                                {promotions.map(promo => (
                                    <SelectItem key={promo.name} value={promo.name}>
                                        {promo.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Select Product"
                                selectedKeys={selectedProduct}
                                onSelectionChange={setSelectedProduct}
                            >
                                <SelectItem key="all" value="all">All Products</SelectItem>
                                {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                ))}
                            </Select>

                            <div className="flex gap-2">
                                <Input type="date" label="From Date" onChange={(e) => setStartDate(e.target.value)} />
                                <Input type="date" label="To Date" onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <Divider className="my-4" />
                        <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} className="mb-4">
                            <Tab key="table" title="Table View" />
                            <Tab key="charts" title="Charts" />
                            <Tab key="insights" title="Insights" />
                        </Tabs>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="lg" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'table' && (
                                    <div className="overflow-auto">
                                        <Table aria-label="Forecast data table">
                                            <TableHeader>
                                                <TableColumn>Product</TableColumn>
                                                <TableColumn>Date</TableColumn>
                                                <TableColumn>Forecast Qty</TableColumn>
                                                <TableColumn>Promotion</TableColumn>
                                                <TableColumn>Model</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredForecasts
                                                    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                                                    .map((forecast) => (
                                                        <TableRow key={forecast.id}>
                                                            <TableCell>{forecast.productName || 'N/A'}</TableCell>
                                                            <TableCell>{forecast.date.toLocaleDateString()}</TableCell>
                                                            <TableCell>{forecast.forecastQuantity}</TableCell>
                                                            <TableCell>{forecast.promotionName || 'No Promotion'}</TableCell>
                                                            <TableCell>{forecast.modelName || 'N/A'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                        <Pagination className="mt-4"
                                                    total={Math.ceil(filteredForecasts.length / rowsPerPage)}
                                                    initialPage={page}
                                                    onChange={setPage}
                                        />
                                    </div>
                                )}
                                {activeTab === 'charts' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader><h3 className="font-semibold">Sales by Promotion Type</h3></CardHeader>
                                            <CardBody className="h-80">
                                                {promoAnalysisData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={promoAnalysisData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                                nameKey="name"
                                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            >
                                                                {promoAnalysisData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex justify-center items-center h-full">
                                                        No data available for the selected filters
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                        <Card>
                                            <CardHeader><h3 className="font-semibold">Sales Over Time by Promotion</h3></CardHeader>
                                            <CardBody className="h-80">
                                                {timeSeriesData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={timeSeriesData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="date" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            {promoAnalysisData.map((promo, index) => (
                                                                <Line
                                                                    key={promo.name}
                                                                    type="monotone"
                                                                    dataKey={promo.name}
                                                                    stroke={COLORS[index % COLORS.length]}
                                                                    activeDot={{ r: 8 }}
                                                                />
                                                            ))}
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex justify-center items-center h-full">
                                                        No data available for the selected filters
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                        <Card className="lg:col-span-2">
                                            <CardHeader><h3 className="font-semibold">Активность промоакций по дням</h3></CardHeader>
                                            <CardBody className="h-96">
                                                {timeSeriesData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={timeSeriesData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="date" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            {promotions.slice(0, 5).map((promo, index) => (
                                                                <Bar
                                                                    key={promo.id}
                                                                    dataKey={promo.name}
                                                                    stackId="a"
                                                                    fill={COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                            <Bar dataKey="No Promotion" stackId="a" fill="#999" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex justify-center items-center h-full">
                                                        No data available
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </div>
                                )}
                                {activeTab === 'insights' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Обновленная карточка эффективности промоакций */}
                                        <Card className="p-4">
                                            <h3 className="font-bold mb-2">Эффективность промоакций</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ScatterChart>
                                                        <CartesianGrid />
                                                        <XAxis type="number" dataKey="productCount" name="Кол-во продуктов" />
                                                        <YAxis type="number" dataKey="avg" name="Средние продажи" />
                                                        <ZAxis type="number" dataKey="value" range={[60, 400]} name="Общий объем" />
                                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                                        <Legend />
                                                        <Scatter name="Промоакции" data={preparePromoEffectiveness()} fill="#8884d8" />
                                                        <ReferenceLine y={preparePromoEffectiveness().find(p => p.name === 'No Promotion')?.avg}
                                                                       label="Без промо" stroke="red" />
                                                    </ScatterChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <Divider className="my-4" />
                                            <h4 className="font-semibold mb-2">Топ промоакций по охвату</h4>
                                            <BarList
                                                data={preparePromoEffectiveness()
                                                    .filter(p => p.name !== 'No Promotion')
                                                    .sort((a,b) => b.productCount - a.productCount)
                                                    .slice(0, 5)
                                                    .map(p => ({ name: p.name, value: p.productCount }))}
                                                className="mt-2"
                                            />
                                        </Card>

                                        {/* Новая карточка воронки продаж */}
                                        <Card className="p-4">
                                            <h3 className="font-bold mb-2">Воронка продаж по продуктам</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={prepareProductPerformance().slice(0, 5)}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="withoutPromo" fill="#8884d8" name="Без промо" />
                                                        <Bar dataKey="withPromo" fill="#82ca9d" name="С промо" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <Divider className="my-4" />
                                            <h4 className="font-semibold mb-2">Прирост от промо (%)</h4>
                                            <Table aria-label="Product promo effect">
                                                <TableHeader>
                                                    <TableColumn>Продукт</TableColumn>
                                                    <TableColumn>Прирост</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {prepareProductPerformance()
                                                        .sort((a,b) => parseFloat(b.promoEffect) - parseFloat(a.promoEffect))
                                                        .slice(0, 3)
                                                        .map(p => (
                                                            <TableRow key={p.name}>
                                                                <TableCell>{p.name}</TableCell>
                                                                <TableCell>
                                                                    <Chip color={p.promoEffect.includes('-') ? 'danger' : 'success'}>
                                                                        {p.promoEffect}
                                                                    </Chip>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </Card>

                                        {/* Карточка с метриками */}
                                        <Card className="p-4 col-span-2">
                                            <h3 className="font-bold mb-4">Ключевые метрики эффективности</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Card shadow="sm" className="text-center p-2">
                                                    <p className="text-sm text-gray-500">Всего прогнозов</p>
                                                    <p className="text-2xl font-bold">{filteredForecasts.length}</p>
                                                </Card>
                                                <Card shadow="sm" className="text-center p-2">
                                                    <p className="text-sm text-gray-500">Средний эффект промо</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {(() => {
                                                            const effect = preparePromoEffectiveness();
                                                            const noPromo = effect.find(p => p.name === 'No Promotion')?.avg || 1;
                                                            const withPromo = effect.filter(p => p.name !== 'No Promotion');
                                                            return withPromo.length > 0
                                                                ? ((withPromo.reduce((a,b) => a + b.avg, 0) / withPromo.length / noPromo - 1) * 100).toFixed(1) + '%'
                                                                : 'N/A';
                                                        })()}
                                                    </p>
                                                </Card>
                                                <Card shadow="sm" className="text-center p-2">
                                                    <p className="text-sm text-gray-500">Самая эффективная промо</p>
                                                    <p className="text-xl font-bold truncate">
                                                        {preparePromoEffectiveness()
                                                            .filter(p => p.name !== 'No Promotion')
                                                            .sort((a,b) => b.avg - a.avg)[0]?.name || 'N/A'}
                                                    </p>
                                                </Card>
                                                <Card shadow="sm" className="text-center p-2">
                                                    <p className="text-sm text-gray-500">Продуктов в анализе</p>
                                                    <p className="text-2xl font-bold">
                                                        {new Set(filteredForecasts.map(f => f.productId)).size}
                                                    </p>
                                                </Card>
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}
                    </CardBody>
                    <CardFooter className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex gap-4 flex-wrap">
                            <Chip color="primary" variant="flat">Total Forecasts: {filteredForecasts.length}</Chip>
                            <Chip color="success" variant="flat">Products: {new Set(filteredForecasts.map(f => f.productId)).size}</Chip>
                            {stats && (
                                <Chip
                                    color={
                                        stats.significance === 'high' ? 'success' :
                                            stats.significance === 'medium' ? 'warning' : 'danger'
                                    }
                                    variant="flat"
                                >
                                    Statistical Significance: {stats.tValue} ({stats.significance})
                                </Chip>
                            )}
                        </div>
                        <Chip color="default" variant="flat">Last Updated: {new Date().toLocaleString()}</Chip>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
export default ForecastAnalysis;