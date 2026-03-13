import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, FileText, Folder, MessageSquare, Image } from 'lucide-react';
import './AdminLayout.css';
import './AdminCommon.css';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>MEGA <strong>ADMIN</strong></h2>
                </div>

                <Link to="/admin" className="admin-nav-item">
                    <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/admin/orders" className="admin-nav-item">
                    <ShoppingBag size={20} /> Orders
                </Link>
                <Link to="/admin/applications" className="admin-nav-item">
                    <Users size={20} /> Collaborators
                </Link>
                <Link to="/admin/products" className="admin-nav-item">
                    <Package size={20} /> Products
                </Link>
                <Link to="/admin/categories" className="admin-nav-item">
                    <Folder size={20} /> Categories
                </Link>
                <Link to="/admin/offers" className="admin-nav-item">
                    <Package size={20} /> Offers
                </Link>
                <Link to="/admin/downloads" className="admin-nav-item">
                    <Package size={20} /> Downloads
                </Link>
                <Link to="/admin/inquiries" className="admin-nav-item">
                    <MessageSquare size={20} /> Inquiries
                </Link>
                <Link to="/admin/subaccounts" className="admin-nav-item">
                    <Users size={20} /> Subaccounts
                </Link>
                <Link to="/admin/blog" className="admin-nav-item">
                    <FileText size={20} /> Blog
                </Link>
                <Link to="/admin/gallery" className="admin-nav-item">
                    <Image size={20} /> Gallery
                </Link>

                <div className="admin-user">
                    <div className="admin-user-info">
                        <span className="admin-user-name">{user?.name}</span>
                        <span className="admin-user-role">{user?.role}</span>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
