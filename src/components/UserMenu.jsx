import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

const UserMenu = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (user?.role === 'admin') return '/admin';
        if (user?.role === 'collaborator') return '/collaborator';
        return '/dashboard'; // Regular user
    };

    return (
        <div className="user-menu-container" onMouseLeave={() => setIsOpen(false)}>
            <div
                className="user-menu-trigger"
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="user-name">{user?.name || 'User'}</span>
                <div className="user-icon-wrapper">
                    <User size={18} />
                </div>
            </div>

            {isOpen && (
                <div className="user-dropdown">
                    <Link to={getDashboardLink()} className="user-dropdown-item">
                        <LayoutDashboard size={16} />
                        Dashboard
                    </Link>
                    {user?.role === 'user' && (
                        <Link to="/dashboard/orders" className="user-dropdown-item">
                            <ShoppingBag size={16} />
                            My Orders
                        </Link>
                    )}
                    <button onClick={handleLogout} className="user-dropdown-item logout">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
