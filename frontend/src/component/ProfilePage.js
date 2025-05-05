import React, { useState, useEffect } from 'react';
import {
    Card,
    Avatar,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Divider,
    Spinner
} from "@nextui-org/react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Модалки для редактирования
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();

    // Поля формы
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUser(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleEditProfile = () => {
        setEditingUser({ ...user });
        onEditOpen();
    };

    const handleSaveProfile = async () => {
        try {
            const response = await axios.put('/profile', editingUser, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUser(response.data);
            onEditClose();
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            alert(error.response?.data?.message || "Ошибка при обновлении профиля");
        }
    };

    const handlePasswordChange = async () => {
        try {
            if (newPassword !== confirmPassword) {
                alert("Новые пароли не совпадают!");
                return;
            }

            const response = await axios.put(
                '/profile/password',
                {
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                alert("Пароль успешно изменён!");
                onPasswordClose();
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.response?.data?.message || "Ошибка при изменении пароля");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Левая часть - информация о пользователе */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <Avatar
                            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                            className="w-32 h-32 mb-4"
                        />
                        <h1 className="text-2xl font-bold">{user.username}</h1>
                        <p className="text-gray-500">{user.roles.join(', ')}</p>

                        <Divider className="my-4" />

                        <div className="flex gap-2 mt-4">
                            <Button color="primary" onPress={handleEditProfile}>
                                Редактировать профиль
                            </Button>
                            <Button color="secondary" onPress={onPasswordOpen}>
                                Сменить пароль
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Модальное окно редактирования профиля */}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalContent>
                    <ModalHeader>Редактирование профиля</ModalHeader>
                    <ModalBody>
                        {editingUser && (
                            <div className="space-y-4">
                                <Input
                                    label="Имя пользователя"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                />
                                <Input
                                    type="file"
                                    label="Фото профиля"
                                    onChange={(e) => setEditingUser({
                                        ...editingUser,
                                        profileImage: e.target.files[0]
                                    })}
                                />
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onEditClose}>
                            Отмена
                        </Button>
                        <Button color="primary" onPress={handleSaveProfile}>
                            Сохранить
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Модальное окно смены пароля */}
            <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
                <ModalContent>
                    <ModalHeader>Смена пароля</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                type="password"
                                label="Текущий пароль"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="Новый пароль"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label="Подтвердите пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onPasswordClose}>
                            Отмена
                        </Button>
                        <Button color="primary" onPress={handlePasswordChange}>
                            Сохранить изменения
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default ProfilePage;