import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Select, SelectItem } from "@nextui-org/react";
import axios from 'axios';

function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
    const [editingUser, setEditingUser] = useState(null);
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/admin/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
            setRoles(['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_USER']);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        onOpen();
    };

    const handlePasswordChange = (user) => {
        setEditingUser(user);
        setPassword('');
        onPasswordOpen();
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:8080/admin/users/${editingUser.id}`, {
                username: editingUser.username,
                roles: editingUser.roles
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchUsers();
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handlePasswordSave = async () => {
        try {
            await axios.put(`http://localhost:8080/admin/users/${editingUser.id}/password`, {
                password: password
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            onPasswordClose();
        } catch (error) {
            console.error('Error updating password:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Управление пользователями</h1>
                <Input
                    placeholder="Поиск пользователей"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                />
            </div>

            <Table aria-label="Users table">
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Имя пользователя</TableColumn>
                    <TableColumn>Роли</TableColumn>
                    <TableColumn>Действия</TableColumn>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.roles.join(', ')}</TableCell>
                            <TableCell className="flex space-x-2">
                                <Button size="sm" onClick={() => handleEdit(user)}>
                                    Редактировать
                                </Button>
                                <Button size="sm" color="secondary" onClick={() => handlePasswordChange(user)}>
                                    Сменить пароль
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Модальное окно редактирования пользователя */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Редактирование пользователя</ModalHeader>
                    <ModalBody>
                        {editingUser && (
                            <div className="space-y-4">
                                <Input
                                    label="Имя пользователя"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                />
                                <Select
                                    label="Роли"
                                    selectionMode="multiple"
                                    selectedKeys={editingUser.roles}
                                    onSelectionChange={(keys) =>
                                        setEditingUser({...editingUser, roles: Array.from(keys)})
                                    }
                                >
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Отмена
                        </Button>
                        <Button color="primary" onPress={handleSave}>
                            Сохранить
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Модальное окно смены пароля */}
            <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
                <ModalContent>
                    <ModalHeader>Смена пароля для {editingUser?.username}</ModalHeader>
                    <ModalBody>
                        <Input
                            type="password"
                            label="Новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onPasswordClose}>
                            Отмена
                        </Button>
                        <Button color="primary" onPress={handlePasswordSave}>
                            Сохранить пароль
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default UsersManagement;