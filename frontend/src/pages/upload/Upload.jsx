import React, { useState, useEffect } from 'react';
import axios from "../../axiosConfig";
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
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip
} from '@nextui-org/react';
import { Search, Filter, ChevronUp, ChevronDown, Trash, Edit, Save, X, MoreVertical } from 'lucide-react';

const Upload = () => {
  const [csv, setCsv] = useState();
  const [googleDataLoaded, setGoogleDataLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [rawData, setRawData] = useState([]);
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

  const {isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsChange} = useDisclosure();
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange} = useDisclosure();

  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  const fieldLabels = {
    id: { ru: 'ID', order: 1 },
    productId: { ru: 'ID товара', order: 2 },
    productName: { ru: 'Название товара', order: 3 },
    quantity: { ru: 'Количество', order: 4 },
    total: { ru: 'Сумма', order: 5 },
    date: { ru: 'Дата продажи', order: 6 },
    promoId: { ru: 'ID акции', order: 7 },
    promoName: { ru: 'Название акции', order: 8 },
    name: { ru: 'Название', order: 2 },
    price: { ru: 'Цена', order: 3 },
    category: { ru: 'Категория', order: 4 },
    discount: { ru: 'Скидка (%)', order: 3 },
    startDate: { ru: 'Начало акции', order: 4 },
    endDate: { ru: 'Конец акции', order: 5 },
    product_name: { ru: 'Название продукта', order: 2 },
    sale_date: { ru: 'Дата продажи', order: 5 },
    sale_quantity: { ru: 'Количество', order: 6 },
    sale_total: { ru: 'Сумма', order: 7 },
    promo_name: { ru: 'Название акции', order: 8 },
    promo_discount: { ru: 'Скидка (%)', order: 9 },
    promo_start_date: { ru: 'Начало акции', order: 10 },
    promo_end_date: { ru: 'Конец акции', order: 11 },
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadSales(),
        loadPromotions(),
        loadRawData()
      ]);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const response = await axios.get("/google-sheet/products");
    setProducts(response.data);
  };

  const loadSales = async () => {
    const response = await axios.get("/google-sheet/sales");
    setSales(response.data);
  };

  const loadPromotions = async () => {
    const response = await axios.get("/google-sheet/promotions");
    setPromotions(response.data);
  };

  const loadRawData = async () => {
    const response = await axios.get("/google-sheet/raw-data");
    setRawData(response.data);
  };

  const loadFromGoogleSheets = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/google-sheet/import");
      setGoogleDataLoaded(true);
      localStorage.setItem('googleDataLoaded', 'true');
      await loadData();
    } catch (error) {
      console.error("Ошибка при импорте из Google Sheets:", error);
    } finally {
      setLoading(false);
    }
  };

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
      await axios.post("/upload", formData, {
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

  const deleteItem = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      switch (activeTab) {
        case 'products': endpoint = `/google-sheet/products/${selectedItem.id}`; break;
        case 'sales': endpoint = `/google-sheet/sales/${selectedItem.id}`; break;
        case 'promotions': endpoint = `/google-sheet/promotions/${selectedItem.id}`; break;
        default: return;
      }

      await axios.delete(endpoint);
      await loadData();
      onDeleteChange();
      onDetailsChange();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      alert("Ошибка при удалении записи");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      let response;

      switch (activeTab) {
        case 'products':
          endpoint = `/google-sheet/products/${editedItem.id}`;
          response = await axios.put(endpoint, editedItem);
          break;
        case 'sales':
          endpoint = `/google-sheet/sales/${editedItem.id}`;
          response = await axios.put(endpoint, editedItem);
          break;
        case 'promotions':
          endpoint = `/google-sheet/promotions/${editedItem.id}`;
          response = await axios.put(endpoint, editedItem);
          break;
        default: return;
      }

      await loadData();
      setIsEditing(false);
      setSelectedItem(editedItem);
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      alert("Ошибка при обновлении записи");
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredSortedData = () => {
    let data = [];
    switch (activeTab) {
      case 'products': data = [...products]; break;
      case 'sales': data = [...sales]; break;
      case 'promotions': data = [...promotions]; break;
      case 'rawData': data = [...rawData]; break;
      default: data = [];
    }

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      data = data.filter(item => {
        // Проверяем все поля, включая вложенные
        for (const key in item) {
          const value = item[key];

          // Обрабатываем вложенные объекты (например, product.name)
          if (typeof value === 'object' && value !== null) {
            for (const nestedKey in value) {
              const nestedValue = value[nestedKey];
              if (nestedValue && nestedValue.toString().toLowerCase().includes(searchTermLower)) {
                return true;
              }
            }
          }

          // Проверяем обычные поля
          if (value && value.toString().toLowerCase().includes(searchTermLower)) {
            return true;
          }
        }
        return false;
      });
    }

    const activeFilters = filters[activeTab];
    if (Object.keys(activeFilters).length > 0) {
      data = data.filter(item =>
          Object.entries(activeFilters).every(([key, value]) =>
              item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())
          )
      );
    }

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

  const paginatedData = () => {
    const filteredData = getFilteredSortedData();
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'products':
        return [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Название' },
          { key: 'price', label: 'Цена' },
          { key: 'category', label: 'Категория' }
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
          { key: 'id', label: 'ID', width: '80px' },
          { key: 'product_name', label: 'Продукт', width: '150px' },
          { key: 'category', label: 'Кат.', width: '100px' },
          { key: 'price', label: 'Цена', width: '80px' },
          { key: 'sale_date', label: 'Дата', width: '120px' },
          { key: 'sale_quantity', label: 'Кол-во', width: '80px' },
          { key: 'sale_total', label: 'Сумма', width: '100px' },
          { key: 'promo_name', label: 'Акция', width: '150px' },
          { key: 'promo_discount', label: 'Скидка', width: '80px' }
        ];
      default:
        return [];
    }
  };

  const openDetails = (item) => {
    if (activeTab === 'sales') {
      setSelectedItem(item);
      setEditedItem({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        total: item.total,
        date: item.date,
        promoId: item.promo?.id || '',
        promoName: item.promo?.name || '',
      });
    } else {
      setSelectedItem(item);
      setEditedItem({...item});
    }
    setIsEditing(false);
    onDetailsOpen();
  };

  const renderDetailsFields = () => {
    const dataToShow = isEditing ? editedItem : selectedItem;
    if (!dataToShow) return null;

    return Object.keys(dataToShow)
        .filter(key => fieldLabels[key])
        .sort((a, b) => fieldLabels[a].order - fieldLabels[b].order)
        .map(key => (
            <div key={key} className="col-span-1">
              <p className="font-semibold text-sm text-gray-600 mb-1">{fieldLabels[key].ru}</p>
              {isEditing ? (
                  <Input
                      size="sm"
                      value={dataToShow[key] ?? ''}
                      onChange={e => setEditedItem({...editedItem, [key]: e.target.value})}
                      className="mb-3"
                  />
              ) : (
                  <p className="text-base mb-3">{dataToShow[key]}</p>
              )}
            </div>
        ));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 shadow-md">
            <div className="flex flex-col gap-6">
              {/* Заголовок и управление */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Управление данными</h1>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <Input
                      placeholder="Поиск..."
                      startContent={<Search className="text-gray-400" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-12 text-base"
                      size="lg"
                  />

                  <div className="flex gap-2">
                    <Select
                        label="Тип данных"
                        selectedKeys={[activeTab]}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="min-w-[200px]"
                        size="sm"
                    >
                      <SelectItem key="products" value="products">Продукты</SelectItem>
                      <SelectItem key="sales" value="sales">Продажи</SelectItem>
                      <SelectItem key="promotions" value="promotions">Акции</SelectItem>
                      <SelectItem key="rawData" value="rawData">Полные данные</SelectItem>
                    </Select>


                  </div>
                </div>
              </div>

              {/* Кнопки загрузки */}
              <div className="flex flex-wrap gap-3">
                <form onSubmit={uploadCSV} className="flex gap-2">
                  <input
                      type="file"
                      accept=".csv"
                      onChange={e => setCsv(e.target.files[0])}
                      className="hidden"
                      id="fileInput"
                  />
                  {/*<label*/}
                  {/*    htmlFor="fileInput"*/}
                  {/*    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition flex items-center gap-2 text-sm"*/}
                  {/*>*/}
                  {/*  Выбрать CSV*/}
                  {/*</label>*/}
                  {/*<Button type="submit" color="primary" size="sm">*/}
                  {/*  Загрузить*/}
                  {/*</Button>*/}
                </form>

                <Button
                    color="success"
                    onClick={loadFromGoogleSheets}
                    isLoading={loading}
                    size="sm"
                >
                  Загрузить из Google Sheets
                </Button>
              </div>

              {googleDataLoaded && (
                  <Chip color="success" variant="flat" size="sm" className="self-start">
                    Данные из Google Sheets успешно загружены
                  </Chip>
              )}

              <Divider className="my-2" />

              {/* Таблица */}
              {loading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
              ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <Table
                          aria-label="Data table"
                          classNames={{
                            wrapper: "p-0",
                            th: "bg-gray-100 text-gray-700 font-semibold text-sm",
                            tr: "hover:bg-gray-50 transition-colors",
                            td: "py-2 px-4"
                          }}
                      >
                        <TableHeader>
                          {getColumns().map((column) => (
                              <TableColumn key={column.key} className="py-3 px-4">
                                <div
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => requestSort(column.key)}
                                >
                                  {column.label}
                                  {sortConfig.key === column.key && (
                                      sortConfig.direction === 'asc' ?
                                          <ChevronUp size={16} className="text-gray-500" /> :
                                          <ChevronDown size={16} className="text-gray-500" />
                                  )}
                                </div>
                              </TableColumn>
                          ))}
                          <TableColumn className="w-20">Действия</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {paginatedData().map((item) => (
                              <TableRow key={item.id} className="group">
                                {getColumns().map((column) => (
                                    <TableCell
                                        key={`${item.id}-${column.key}`}
                                        onClick={() => openDetails(item)}
                                        className="cursor-pointer"
                                    >
                                      {column.key.includes('.') ?
                                          column.key.split('.').reduce((obj, key) => obj?.[key], item) :
                                          item[column.key]}
                                    </TableCell>
                                ))}
                                <TableCell>
                                  <Dropdown>
                                    <DropdownTrigger>
                                      <Button
                                          isIconOnly
                                          size="sm"
                                          variant="light"
                                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical size={16} />
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Actions">
                                      <DropdownItem
                                          key="edit"
                                          startContent={<Edit size={16} />}
                                          onPress={() => {
                                            setSelectedItem(item);
                                            setEditedItem({ ...item });
                                            setIsEditing(true);
                                            onDetailsOpen();
                                          }}
                                      >
                                        Редактировать
                                      </DropdownItem>
                                      <DropdownItem
                                          key="delete"
                                          className="text-danger"
                                          color="danger"
                                          startContent={<Trash size={16} />}
                                          onPress={() => {
                                            setSelectedItem(item);
                                            onDeleteOpen();
                                          }}
                                      >
                                        Удалить
                                      </DropdownItem>
                                    </DropdownMenu>
                                  </Dropdown>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Пагинация */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                  <span className="text-sm text-gray-600">
                    Показано {Math.min(page * rowsPerPage, getFilteredSortedData().length)} из {getFilteredSortedData().length} записей
                  </span>
                      <Pagination
                          total={Math.ceil(getFilteredSortedData().length / rowsPerPage)}
                          initialPage={page}
                          onChange={setPage}
                          showControls
                          color="primary"
                          size="sm"
                      />
                    </div>
                  </>
              )}
            </div>
          </Card>

          {/* Модальное окно с деталями */}
          <Modal isOpen={isDetailsOpen} onOpenChange={onDetailsChange} size="2xl">
            <ModalContent>
              {(onClose) => (
                  <>
                    <ModalHeader className="pb-2">
                      <h2 className="text-xl font-semibold">
                        {isEditing ? 'Редактирование записи' : 'Детальная информация'}
                      </h2>
                    </ModalHeader>

                    <ModalBody className="py-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
                        {renderDetailsFields()}
                      </div>
                    </ModalBody>

                    <ModalFooter className="pt-2">
                      <div className="flex justify-between w-full items-center">
                        <div>
                          {!isEditing && (
                              <Button
                                  color="danger"
                                  variant="light"
                                  startContent={<Trash size={16} />}
                                  onPress={onDeleteOpen}
                                  size="sm"
                                  className="px-2"
                              >
                                Удалить
                              </Button>
                          )}
                        </div>

                        <div className="flex gap-1">
                          {!isEditing ? (
                              <Button
                                  color="primary"
                                  startContent={<Edit size={16} />}
                                  onPress={() => setIsEditing(true)}
                                  size="sm"
                                  className="px-2"
                              >
                                Редактировать
                              </Button>
                          ) : (
                              <>
                                <Button
                                    color="success"
                                    startContent={<Save size={16} />}
                                    onPress={updateItem}
                                    isLoading={loading}
                                    size="sm"
                                    className="px-2"
                                >
                                  Сохранить
                                </Button>
                                <Button
                                    color="warning"
                                    variant="light"
                                    startContent={<X size={16} />}
                                    onPress={() => setIsEditing(false)}
                                    size="sm"
                                    className="px-2"
                                >
                                  Отмена
                                </Button>
                              </>
                          )}
                          <Button
                              onPress={onClose}
                              variant="light"
                              size="sm"
                              className="px-2"
                          >
                            Закрыть
                          </Button>
                        </div>
                      </div>
                    </ModalFooter>
                  </>
              )}
            </ModalContent>
          </Modal>
          {/* Модальное окно подтверждения удаления */}
          <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} size="md">
            <ModalContent>
              {(onClose) => (
                  <>
                    <ModalHeader>
                      <h2 className="text-lg font-semibold">Подтверждение удаления</h2>
                    </ModalHeader>
                    <ModalBody>
                      <p className="text-gray-700">Вы уверены, что хотите удалить эту запись?</p>
                      <p className="text-sm text-gray-500 mt-1">Действие нельзя будет отменить.</p>
                    </ModalBody>
                    <ModalFooter>
                      <div className="flex justify-end gap-2 w-full">
                        <Button
                            color="default"
                            onPress={onClose}
                            variant="light"
                            size="sm"
                        >
                          Отмена
                        </Button>
                        <Button
                            color="danger"
                            onPress={() => {
                              deleteItem();
                              onClose();
                            }}
                            isLoading={loading}
                            size="sm"
                        >
                          Удалить
                        </Button>
                      </div>
                    </ModalFooter>
                  </>
              )}
            </ModalContent>
          </Modal>
        </div>
      </div>
  );
};

export default Upload;