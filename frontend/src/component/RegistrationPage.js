import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function RegistrationPage() {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');  // Состояние для выбора роли
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegistration = async () => {
    try {
      const userData = {
        username,
        password,
        roles: [role] // Отправляем выбранную роль
      };

      const response = await axios.post('http://localhost:8080/register', userData);
      console.log('Пользователь зарегистрирован:', response.data);

    } catch (error) {
      console.error('Ошибка регистрации:', error);
    }
    setRegistrationSuccess(true);
  };

  if (registrationSuccess) {
    return (
        <div className='centered-container'>
          <div className="login-container">
            <h1>Регистрация успешно завершена!</h1>
            <div className="registration-link">
              <p>Для входа в ваш аккаунт <a href="/">Авторизуйтесь здесь</a></p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="centered-container">
        <div className="login-container">
          <h2>Регистрация</h2>
          <div className="input-container">
            <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="input-container">
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-container">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Выберите роль</option>
              <option value="ROLE_ANALYST">Аналитик</option>
              <option value="ROLE_ADMIN">Администратор</option>
            </select>
          </div>
          <button className="login-button" onClick={handleRegistration}>Зарегистрироваться</button>
          <div className="login-link">
            <p className='registration-link'>Уже есть аккаунт? <a href="/">Войти здесь</a></p>
          </div>
        </div>
      </div>
  );
}

export default RegistrationPage;