// NavBar.js
import React, { useState } from 'react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

function NavBar({ user, onLogout }) {
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);

    const toggleUserMenu = () => {
        setUserMenuOpen(!isUserMenuOpen);
    };

    return (
        <nav className="navbar">
            <span>Ciao {user.username}!</span>
            <div className="nav-icons">
                <FaUser className="user-icon" onClick={toggleUserMenu} />
                {isUserMenuOpen && (
                    <div className="custom-menu">
                        <ul>
                            <li>Profilo</li>
                            <li>News</li>
                            <li onClick={onLogout}>Logout</li>
                        </ul>
                    </div>
                )}
                <FaShoppingCart className="cart-icon" />
            </div>
        </nav>
    );
}

export default NavBar;
