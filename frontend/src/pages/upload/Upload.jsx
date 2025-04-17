import React, { useState, useEffect } from 'react';
import axios from "../../axiosConfig";
import Navbarr from '../../component/navbarr';
import Sidebar from '../../component/Sidebar';
import {
  Card,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Select,
  SelectItem,
  Pagination,
  Spinner,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@nextui-org/react';
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';

const Upload = () => {
  const [csv, setCsv] = useState();
  const [googleDataLoaded, setGoogleDataLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [rawData, setRawData] = useState([]); // Новое состояние для сырых данных
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    products: {},
    sales: {},
    promotions: {},
    rawData: {}
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Загрузка данных
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadSales(),
        loadPromotions(),
        loadRawData() // Загружаем сырые данные
      ]);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка продуктов
  const loadProducts = async () => {
    const response = await axios.get("http://localhost:8080/google-sheet/products");
    setProducts(response.data);
  };

  // Загрузка продаж
  const loadSales = async () => {
    const response = await axios.get("http://localhost:8080/google-sheet/sales");
    setSales(response.data);
  };

  // Загрузка акций
  const loadPromotions = async () => {
    const response = await axios.get("http://localhost:8080/google-sheet/promotions");
    setPromotions(response.data);
  };

  // Загрузка сырых данных
  const loadRawData = async () => {
    const response = await axios.get("http://localhost:8080/google-sheet/raw-data");
    setRawData(response.data);
  };

  // Загрузка данных с Google Sheets
  const loadFromGoogleSheets = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/google-sheet/import");
      console.log("Импорт завершён:", response.data);
      setGoogleDataLoaded(true);
      localStorage.setItem('googleDataLoaded', 'true');
      await loadData();
    } catch (error) {
      console.error("Ошибка при импорте из Google Sheets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка CSV
  const uploadCSV = async (e) => {
    e.preventDefault();
    if (!csv) {
      alert("Пожалуйста, выберите CSV файл.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csv);

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Файл успешно загружен!");
      await loadData();
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      alert("Ошибка при загрузке файла.");
    } finally {
      setLoading(false);
    }
  };

  // Сортировка данных
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Фильтрация и сортировка данных
  const getFilteredSortedData = () => {
    let data = [];
    switch (activeTab) {
      case 'products':
        data = [...products];
        break;
      case 'sales':
        data = [...sales];
        break;
      case 'promotions':
        data = [...promotions];
        break;
      case 'rawData':
        data = [...rawData];
        break;
      default:
        data = [];
    }

    // Поиск
    if (searchTerm) {
      data = data.filter(item =>
          Object.values(item).some(
              val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Фильтрация
    const activeFilters = filters[activeTab];
    if (Object.keys(activeFilters).length > 0) {
      data = data.filter(item =>
          Object.entries(activeFilters).every(([key, value]) =>
              item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())
          )
      );
    }

    // Сортировка
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  };

  // Пагинация
  const paginatedData = () => {
    const filteredData = getFilteredSortedData();
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  };

  // Колонки таблицы
  const getColumns = () => {
    switch (activeTab) {
      case 'products':
        return [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Название' },
          { key: 'price', label: 'Цена' },
          { key: 'category', label: 'Категория' },
          { key: 'stock', label: 'На складе' }
        ];
      case 'sales':
        return [
          { key: 'id', label: 'ID' },
          { key: 'product.name', label: 'Товар' },
          { key: 'quantity', label: 'Количество' },
          { key: 'total', label: 'Сумма' },
          { key: 'date', label: 'Дата' }
        ];
      case 'promotions':
        return [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Название' },
          { key: 'discount', label: 'Скидка (%)' },
          { key: 'startDate', label: 'Начало' },
          { key: 'endDate', label: 'Конец' }
        ];
      case 'rawData':
        return [
          { key: 'id', label: 'ID' },
          { key: 'product_name', label: 'Название продукта' },
          { key: 'category', label: 'Категория' },
          { key: 'price', label: 'Цена' },
          { key: 'sale_date', label: 'Дата продажи' },
          { key: 'sale_quantity', label: 'Количество' },
          { key: 'sale_total', label: 'Сумма' },
          { key: 'promo_name', label: 'Акция' },
          { key: 'promo_discount', label: 'Скидка (%)' },
          { key: 'promo_start_date', label: 'Начало акции' },
          { key: 'promo_end_date', label: 'Конец акции' }
        ];
      default:
        return [];
    }
  };

  // Открытие модального окна с деталями
  const openDetails = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
      <>
        <div className='w-full h-full flex flex-row flex-wrap bg-gradient-to-t from-sky-700 to-blue-500'>
          <div className='w-1/5 h-full sticky top-0'>
          </div>
          <div className='w-4/5 h-full flex flex-col items-center p-4'>
            <Card className='p-6 w-full max-w-6xl mt-4'>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                      placeholder="Поиск..."
                      startContent={<Search />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                      color="primary"
                      startContent={<Filter />}
                      onPress={() => console.log("Фильтры")}
                  >
                    Фильтры
                  </Button>
                  <Select
                      label="Тип данных"
                      selectedKeys={[activeTab]}
                      onChange={(e) => setActiveTab(e.target.value)}
                      className="min-w-[150px]"
                  >
                    <SelectItem key="products" value="products">Продукты</SelectItem>
                    <SelectItem key="sales" value="sales">Продажи</SelectItem>
                    <SelectItem key="promotions" value="promotions">Акции</SelectItem>
                    <SelectItem key="rawData" value="rawData">Полные данные</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <form onSubmit={uploadCSV} className="flex items-center gap-2">
                  <input
                      type="file"
                      accept=".csv"
                      onChange={e => setCsv(e.target.files[0])}
                      className="hidden"
                      id="fileInput"
                  />
                  <label
                      htmlFor="fileInput"
                      className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition"
                  >
                    Выбрать CSV
                  </label>
                  <Button type="submit" color="primary">
                    Загрузить
                  </Button>
                </form>
                <Button
                    color="success"
                    onClick={loadFromGoogleSheets}
                    isLoading={loading}
                >
                  Загрузить из Google Sheets
                </Button>
              </div>

              {googleDataLoaded && (
                  <Chip color="success" variant="flat" className="mb-4">
                    Данные из Google Sheets успешно загружены
                  </Chip>
              )}

              <Divider className="my-4" />

              {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
              ) : (
                  <>
                    <div className="overflow-auto">
                      <Table aria-label="Data table" className="min-w-full">
                        <TableHeader>
                          {getColumns().map((column) => (
                              <TableColumn key={column.key}>
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => requestSort(column.key)}
                                >
                                  {column.label}
                                  {sortConfig.key === column.key && (
                                      sortConfig.direction === 'asc' ?
                                          <ChevronUp className="ml-1" /> :
                                          <ChevronDown className="ml-1" />
                                  )}
                                </div>
                              </TableColumn>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {paginatedData().map((item) => (
                              <TableRow
                                  key={item.id}
                                  onClick={() => openDetails(item)}
                                  className="hover:bg-blue-50 cursor-pointer"
                              >
                                {getColumns().map((column) => (
                                    <TableCell key={`${item.id}-${column.key}`}>
                                      {column.key.includes('.') ?
                                          column.key.split('.').reduce((obj, key) => obj?.[key], item) :
                                          item[column.key]}
                                    </TableCell>
                                ))}
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-600">
                    Показано {Math.min(page * rowsPerPage, getFilteredSortedData().length)} из {getFilteredSortedData().length} записей
                  </span>
                      <Pagination
                          total={Math.ceil(getFilteredSortedData().length / rowsPerPage)}
                          initialPage={page}
                          onChange={setPage}
                      />
                    </div>
                  </>
              )}
            </Card>
          </div>
        </div>

        {/* Модальное окно с деталями */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl">
          <ModalContent>
            <ModalHeader>Детальная информация</ModalHeader>
            <ModalBody>
              {selectedItem && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedItem).map(([key, value]) => (
                        <div key={key} className="col-span-1">
                          <p className="font-semibold">{key}</p>
                          <p>{typeof value === 'object' ? JSON.stringify(value) : value}</p>
                        </div>
                    ))}
                  </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={() => setIsModalOpen(false)}>Закрыть</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
  );
};

export default Upload;