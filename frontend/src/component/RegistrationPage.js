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
      console.log('User registered:', response.data);

    } catch (error) {
      console.error('Registration error:', error);
    }
    setRegistrationSuccess(true);
  };

  if (registrationSuccess) {
    return (
        <div className='centered-container'>
          <div className="login-container">
            <h1>Registrazione effettuata con successo!</h1>
            <div className="registration-link">
              <p>Per accedere al tuo nuovo account <a href="/">Login here</a></p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="centered-container">
        <div className="login-container">
          <h2>Registration</h2>
          <div className="input-container">
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="input-container">
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-container">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="ROLE_ANALYST">Analyst</option>
              <option value="ROLE_ADMIN">Administrator</option>
            </select>
          </div>
          <button className="login-button" onClick={handleRegistration}>Register</button>
          <div className="login-link">
            <p className='registration-link'>Already have an account? <a href="/">Login here</a></p>
          </div>
        </div>
      </div>
  );
}

export default RegistrationPage;
