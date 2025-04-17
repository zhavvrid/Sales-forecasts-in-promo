import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './design/HomePage.css';

Modal.setAppElement('#root');

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Создаём экземпляр axios с базовым URL и настройками
  const api = axios.create({
    baseURL: 'http://localhost:8080',
  });

  // Добавляем интерцептор для автоматической вставки токена
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', {
        username: email,
        password,
      });
      console.log('Response from server:', response.data);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        onLogin({
          username: response.data.user?.username,
          token: response.data.token,
          roles: response.data.user?.roles || [] // Получаем роли с сервера
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.error || 'Ошибка авторизации');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
      <div className='login-container'>
        <div className="login-form">
          <h2>Sign in to your account</h2>
          <div className="input-container">
            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="login-button" onClick={handleLogin}>Login</button>
        </div>

        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Error"
            className="error-modal"
        >
          <h2>Error</h2>
          <p>{errorMessage}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
      </div>
  );
}

export default LoginPage;