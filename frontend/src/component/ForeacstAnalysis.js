import React, { useState, useEffect, useMemo } from 'react';
import axios from "../axiosConfig";
import {
    Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Select, SelectItem, Button, Spinner, Divider, Chip,
    Tabs, Tab, CardBody, CardHeader, CardFooter, Pagination, Input
} from '@nextui-org/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import { Download } from 'lucide-react';
import { BarList } from '@tremor/react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ForecastAnalysis = () => {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(new Set(['all']));
    const [promotions, setPromotions] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
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
            const selectedCategoryValue = [...selectedCategory][0];

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

            return matchesPromotion && matchesProduct && matchesDate;
        });
    }, [forecasts, selectedPromotion, selectedProduct, startDate, endDate]);

    const preparePromoEffectiveness = () => {
        const promoGroups = {};

        filteredForecasts.forEach(f => {
            const key = f.promotionName || 'Без акции';
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

        return Object.values(productData).map(p => {
            // Исправление для случаев, когда нет продаж без акции
            const promoEffect = p.withoutPromo > 0
                ? ((p.withPromo - p.withoutPromo) / p.withoutPromo * 100).toFixed(1) + '%'
                : p.withPromo > 0
                    ? '100% (только с акцией)'
                    : 'N/A';

            return {
                ...p,
                promoEffect
            };
        });
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const calculateStatisticalSignificance = () => {
        const data = preparePromoEffectiveness();
        const noPromo = data.find(p => p.name === 'Без акции');
        const withPromo = data.filter(p => p.name !== 'Без акции');

        if (!noPromo || withPromo.length === 0) return null;

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
            significance: Math.abs(tValue) > 2 ? 'высокая' : Math.abs(tValue) > 1 ? 'средняя' : 'низкая'
        };
    };

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [forecastsRes, promotionsRes, productsRes] = await Promise.all([
                axios.get('/forecast'),
                axios.get('/google-sheet/promotions'),
                axios.get('/google-sheet/products')
            ]);

            const forecastsWithDates = forecastsRes.data.map(forecast => ({
                ...forecast,
                date: new Date(forecast.date)
            }));

            setForecasts(forecastsWithDates);
            setPromotions(promotionsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const preparePromoAnalysisData = () => {
        const promoData = {};

        filteredForecasts.forEach(forecast => {
            const promoKey = forecast.promotionName || 'Без акции';

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

    const prepareCategoryData = () => {
        const categoryData = {};

        filteredForecasts.forEach(f => {
            const category = f.category || 'Неизвестно';
            if (!categoryData[category]) {
                categoryData[category] = {
                    name: category,
                    value: 0,
                    promoValue: 0,
                    nonPromoValue: 0
                };
            }
            categoryData[category].value += f.forecastQuantity;
            if (f.promotionName) {
                categoryData[category].promoValue += f.forecastQuantity;
            } else {
                categoryData[category].nonPromoValue += f.forecastQuantity;
            }
        });

        return Object.values(categoryData).sort((a, b) => b.value - a.value);
    };

    const prepareDailyTrendData = () => {
        const dailyData = {};

        filteredForecasts.forEach(f => {
            const dateStr = f.date.toISOString().split('T')[0];
            if (!dailyData[dateStr]) {
                dailyData[dateStr] = {
                    date: dateStr,
                    total: 0,
                    promo: 0,
                    nonPromo: 0
                };
            }
            dailyData[dateStr].total += f.forecastQuantity;
            if (f.promotionName) {
                dailyData[dateStr].promo += f.forecastQuantity;
            } else {
                dailyData[dateStr].nonPromo += f.forecastQuantity;
            }
        });

        return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const promoAnalysisData = preparePromoAnalysisData();
    const categoryData = prepareCategoryData();
    const dailyTrendData = prepareDailyTrendData();
    const stats = calculateStatisticalSignificance();

    const exportData = () => {
        const dataStr = JSON.stringify(filteredForecasts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `анализ-прогнозов-${new Date().toISOString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="w-full min-h-screen p-4 bg-gradient-to-t from-sky-700 to-blue-500">
            <Card className="w-full max-w-full mx-auto p-6">
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold">Анализ прогноза продаж</h2>
                    <div className="flex gap-2">
                        <Button color="primary" startContent={<Download />} onPress={exportData}>Экспорт данных</Button>
                        <Button onPress={loadInitialData}>Обновить данные</Button>
                    </div>
                </CardHeader>

                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Select
                            label="Выберите акцию"
                            selectedKeys={selectedPromotion}
                            onSelectionChange={setSelectedPromotion}
                        >
                            <SelectItem key="all" value="all">Все акции</SelectItem>
                            <SelectItem key="none" value="none">Без акции</SelectItem>
                            {promotions.map(promo => (
                                <SelectItem key={promo.name} value={promo.name}>
                                    {promo.name}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Выберите товар"
                            selectedKeys={selectedProduct}
                            onSelectionChange={setSelectedProduct}
                        >
                            <SelectItem key="all" value="all">Все товары</SelectItem>
                            {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                            ))}
                        </Select>

                        <div className="flex gap-2">
                            <Input type="date" label="С даты" onChange={(e) => setStartDate(e.target.value)} />
                            <Input type="date" label="По дату" onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <Divider className="my-4" />
                    <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} className="mb-4">
                        <Tab key="table" title="Таблица" />
                        <Tab key="charts" title="Графики" />
                        <Tab key="insights" title="Аналитика" />
                    </Tabs>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'table' && (
                                <div className="overflow-auto">
                                    <Table aria-label="Таблица прогнозов">
                                        <TableHeader>
                                            <TableColumn>Товар</TableColumn>
                                            <TableColumn>Дата</TableColumn>
                                            <TableColumn>Прогноз кол-ва</TableColumn>
                                            <TableColumn>Акция</TableColumn>
                                            <TableColumn>Модель</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredForecasts
                                                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                                                .map((forecast) => (
                                                    <TableRow key={forecast.id}>
                                                        <TableCell>{forecast.productName || 'Н/Д'}</TableCell>
                                                        <TableCell>{forecast.date.toLocaleDateString()}</TableCell>
                                                        <TableCell>{forecast.forecastQuantity}</TableCell>
                                                        <TableCell>{forecast.promotionName || 'Без акции'}</TableCell>
                                                        <TableCell>{forecast.modelName || 'Н/Д'}</TableCell>
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
                                    <Card className="p-4">
                                        <h3 className="font-bold mb-2">Продажи по типам акций</h3>
                                        <div className="h-80">
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
                                        </div>
                                    </Card>


                                    <Card className="p-4">
                                        <h3 className="font-bold mb-2">Эффективность акций по товарам</h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart outerRadius={90} data={prepareProductPerformance().slice(0, 8)}>
                                                    <PolarGrid />
                                                    <PolarAngleAxis dataKey="name" />
                                                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                                                    <Radar name="С акцией" dataKey="withPromo" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                                    <Radar name="Без акции" dataKey="withoutPromo" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                                    <Legend />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>
                            )}
                            {activeTab === 'insights' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="p-4">
                                        <h3 className="font-bold mb-2">Эффективность акций</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={preparePromoEffectiveness().filter(p => p.name !== 'Без акции')}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="avg" fill="#8884d8" name="Средние продажи" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <Divider className="my-4" />
                                        <h4 className="font-semibold mb-2">Топ акций по охвату</h4>
                                        <BarList
                                            data={preparePromoEffectiveness()
                                                .filter(p => p.name !== 'Без акции')
                                                .sort((a,b) => b.productCount - a.productCount)
                                                .slice(0, 5)
                                                .map(p => ({ name: p.name, value: p.productCount }))}
                                            className="mt-2"
                                        />
                                    </Card>

                                    <Card className="p-4">
                                        <h3 className="font-bold mb-2">Продажи по товарам</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={prepareProductPerformance().slice(0, 5)}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="withoutPromo" fill="#8884d8" name="Без акции" />
                                                    <Bar dataKey="withPromo" fill="#82ca9d" name="С акцией" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <Divider className="my-4" />
                                        <h4 className="font-semibold mb-2">Прирост от акции</h4>
                                        <Table aria-label="Эффективность акций">
                                            <TableHeader>
                                                <TableColumn>Товар</TableColumn>
                                                <TableColumn>Прирост</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {prepareProductPerformance()
                                                    .filter(p => p.promoEffect !== 'N/A')
                                                    .sort((a,b) => {
                                                        const aVal = a.promoEffect.includes('только') ? 100 : parseFloat(a.promoEffect);
                                                        const bVal = b.promoEffect.includes('только') ? 100 : parseFloat(b.promoEffect);
                                                        return bVal - aVal;
                                                    })
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

                                    <Card className="p-4 col-span-2">
                                        <h3 className="font-bold mb-4">Ключевые показатели</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <Card shadow="sm" className="text-center p-2">
                                                <p className="text-sm text-gray-500">Всего прогнозов</p>
                                                <p className="text-2xl font-bold">{filteredForecasts.length}</p>
                                            </Card>
                                            <Card shadow="sm" className="text-center p-2">
                                                <p className="text-sm text-gray-500">Средний прирост от акции</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {(() => {
                                                        const effect = preparePromoEffectiveness();
                                                        const noPromo = effect.find(p => p.name === 'Без акции')?.avg || 1;
                                                        const withPromo = effect.filter(p => p.name !== 'Без акции');
                                                        return withPromo.length > 0
                                                            ? ((withPromo.reduce((a,b) => a + b.avg, 0) / withPromo.length / noPromo - 1) * 100).toFixed(1) + '%'
                                                            : 'Н/Д';
                                                    })()}
                                                </p>
                                            </Card>
                                            <Card shadow="sm" className="text-center p-2">
                                                <p className="text-sm text-gray-500">Самая эффективная акция</p>
                                                <p className="text-xl font-bold truncate">
                                                    {preparePromoEffectiveness()
                                                        .filter(p => p.name !== 'Без акции')
                                                        .sort((a,b) => b.avg - a.avg)[0]?.name || 'Н/Д'}
                                                </p>
                                            </Card>
                                            <Card shadow="sm" className="text-center p-2">
                                                <p className="text-sm text-gray-500">Товаров в анализе</p>
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
                        <Chip color="primary" variant="flat">Всего прогнозов: {filteredForecasts.length}</Chip>
                        <Chip color="success" variant="flat">Товаров: {new Set(filteredForecasts.map(f => f.productId)).size}</Chip>
                        {stats && (
                            <Chip
                                color={
                                    stats.significance === 'высокая' ? 'success' :
                                        stats.significance === 'средняя' ? 'warning' : 'danger'
                                }
                                variant="flat"
                            >
                                Статистическая значимость: {stats.tValue} ({stats.significance})
                            </Chip>
                        )}
                    </div>
                    <Chip color="default" variant="flat">Обновлено: {new Date().toLocaleString()}</Chip>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForecastAnalysis;