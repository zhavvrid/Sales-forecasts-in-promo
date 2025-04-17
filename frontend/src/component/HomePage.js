import React, { useState } from 'react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';
import './design/HomePage.css';

function HomePage({ user, onLogout }) {
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const goToProfile = () => {
        setUserMenuOpen(false);
        navigate('/profile');
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!isUserMenuOpen);
    };

    return (
        <div className="layout-wrapper">
            <div className="home-page">
                <nav className="navbar">
                    <div className="left-logo">
                        <span className="logo-text">SalesSights {user.username}</span>
                    </div>
                    <div className="right-buttons">
                        {/*<button className="login-btn">Login</button>*/}
                        {/*<button className="signup-btn">Sign Up</button>*/}
                        <FaUser className="user-icon" onClick={toggleUserMenu} />
                        {isUserMenuOpen && (
                            <div className="custom-menu">
                                <ul>
                                    <li onClick={goToProfile}>Profile</li>
                                    <li>News</li>
                                    <li onClick={onLogout}>Logout</li>
                                </ul>
                            </div>
                        )}
                       {/* <FaShoppingCart className="cart-icon" />*/}
                    </div>
                </nav>
            <div className="main-section">

                <main className="main-content">
                    <h1 className="text-5xl text-black font-bold mt-8 m-2 text-center">
                        ForecastMaster
                    </h1>
                    <h2 className="text-3xl text-black mb-10 text-center">
                        Streamlined Sales Prediction Website
                    </h2>

                    <div className="card-grid">
                        <Card className="py-4 w-full sm:w-1/2 md:w-1/3 h-auto dark-card">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-md uppercase font-bold text-white">Get Incredible Predictions</p>
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl"
                                    src="/assets/sales.png"
                                    width={500}
                                />
                                <h4 className="font-bold text-large text-white">Using Our Regression Model</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2" />
                        </Card>

                        <Card className="py-4 w-full sm:w-1/2 md:w-1/3 h-auto dark-card">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-md uppercase font-bold text-white">Forecast Future Sales</p>
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl"
                                    src="/assets/graph.png"
                                    width={500}
                                />
                                <h4 className="font-bold text-large text-white">With Our LSTM Model</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2" />
                        </Card>
                    </div>
                </main>
            </div>
        </div>
        </div>
    );
}

export default HomePage;
