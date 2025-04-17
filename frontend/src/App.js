import React, { useState } from 'react';
import { BrowserRouter as Router, Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import ForecastPage from './component/ForecastPage';
import LoginPage from './component/LoginPage';
import HomePage from './component/HomePage';
import RegistrationPage from './component/RegistrationPage';
import Upload from './pages/upload/Upload';
import ProfilePage from "./component/ProfilePage";
import AdminSidebar from './component/AdminSidebar';
import AnalystSidebar from './component/AnalystSidebar';
import UsersManagement from './component/UsersManagement';
import { Button } from '@nextui-org/react';
import { Menu } from 'lucide-react';
import ForecastAnalysis from "./component/ForeacstAnalysis";

function App() {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const roles = localStorage.getItem('userRoles');
        if (token && roles) {
            return {
                token,
                roles: JSON.parse(roles)
            };
        }
        return null;
    });

    const [sidebarOpen, setSidebarOpen] = useState(true); // Состояние для управления видимостью сайдбара

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userRoles', JSON.stringify(userData.roles));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRoles');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const roles = user?.roles?.map(role => role.name) || [];
    const isAdmin = roles.includes('ROLE_ADMIN');
    const isAnalyst = roles.includes('ROLE_ANALYST');

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={
                        !user ? <LoginPage onLogin={handleLogin} /> :
                            <HomeLayout
                                user={user}
                                onLogout={handleLogout}
                                isAdmin={isAdmin}
                                isAnalyst={isAnalyst}
                                setUser={setUser}
                                sidebarOpen={sidebarOpen}
                                toggleSidebar={toggleSidebar}
                            />
                    } />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/forecast" element={
                        user ? <ForecastPage /> : <Navigate to="/" replace />
                    } />
                    <Route path="/forecast-analysis" element={<ForecastAnalysis />} />
                    <Route path="/profile" element={
                        user ? <ProfilePage user={user} onUpdate={setUser} /> : <Navigate to="/" replace />
                    } />
                    <Route path="/upload" element={
                        user ? <Upload /> : <Navigate to="/" replace />
                    } />
                    <Route path="/users" element={
                        isAdmin ? <UsersManagement /> : <Navigate to="/" replace />
                    } />
                    <Route path="/admin/users" element={<UsersManagement /> } />
                </Routes>
                <div>
                    {!user && <AuthLink />}
                </div>
            </div>
        </Router>
    );
}

function AuthLink() {
    const location = useLocation();
    if (location.pathname !== '/register') {
        return (
            <p className="registration-link">
                Don't have an account? <Link to="/register">Click here to register</Link>
            </p>
        );
    }
    return null;
}

function HomeLayout({ user, onLogout, isAdmin, isAnalyst, setUser, sidebarOpen, toggleSidebar }) {
    return (
        <div className="flex h-screen">
            {/* Кнопка для управления сайдбаром */}
            <Button
                isIconOnly
                className="fixed top-4 left-4 z-50"
                onClick={toggleSidebar}
            >
                <Menu />
            </Button>

            {/* Сайдбар */}
            <div className={`sidebar bg-[#1e293b] text-white transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                {isAdmin && <AdminSidebar onLogout={onLogout} />}
                {isAnalyst && !isAdmin && <AnalystSidebar onLogout={onLogout} />}
            </div>

            {/* Основное содержимое */}
            <div className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Routes>
                    <Route path="/" element={<HomePage user={user} onLogout={onLogout}/>} />
                    <Route path="/forecast" element={<ForecastPage />} />
                    <Route path="/profile" element={<ProfilePage user={user} onUpdate={user => setUser(user)} />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/admin/users" element={<UsersManagement />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;