import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    AlertCircle,
    Zap,
    MapPin,
    Download,
    Users,
    Wallet,
    Tag,
    FileCheck,
    LogOut,
    User as UserIcon
} from 'lucide-react';
import './CollaboratorLayout.css';
import logoImage from '../../assets/images/logo.png';

const CollaboratorLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Check Status
    const status = user?.collaborator_status || 'pending';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (status !== 'approved') {
        return (
            <div className="pending-view-wrapper" style={{ padding: '60px', textAlign: 'center' }}>
                <div className="pending-content">
                    <h1>Application Status: {status.toUpperCase()}</h1>
                    <p>Your application is currently under review. Please check back later.</p>
                    <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Logout</button>
                </div>
            </div>
        );
    }

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const hasPermission = (permission) => {
        if (!user?.parent_id) return true; // Parent account has all permissions
        return user?.permissions?.includes(permission);
    };

    return (
        <div className="collaborator-layout">
            <aside className="collaborator-sidebar">
                <div className="sidebar-logo">
                    <img src={logoImage} alt="Mega Solutions" />
                </div>

                <div className="sidebar-user">
                    <div className="user-avatar">
                        <UserIcon size={20} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-company">{user?.company_name || 'Collaborator'}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <Link to="/collaborator" className={`nav-item ${isActive('/collaborator')}`}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/collaborator/orders" className={`nav-item ${isActive('/collaborator/orders')}`}>
                            <ShoppingCart size={20} />
                            <span>Orders</span>
                        </Link>
                        {hasPermission('submit_quotes') && (
                            <Link to="/collaborator/quotes" className={`nav-item ${isActive('/collaborator/quotes')}`}>
                                <FileText size={20} />
                                <span>Quotes</span>
                            </Link>
                        )}
                        {hasPermission('manage_claims') && (
                            <Link to="/collaborator/claims" className={`nav-item ${isActive('/collaborator/claims')}`}>
                                <AlertCircle size={20} />
                                <span>Claims</span>
                            </Link>
                        )}
                        <Link to="/collaborator/quick-order" className={`nav-item ${isActive('/collaborator/quick-order')}`}>
                            <Zap size={20} />
                            <span>Quick Order</span>
                        </Link>
                    </div>

                    <div className="nav-group">
                        <Link to="/collaborator/addresses" className={`nav-item ${isActive('/collaborator/addresses')}`}>
                            <MapPin size={20} />
                            <span>Address Book</span>
                        </Link>
                        <Link to="/collaborator/downloads" className={`nav-item ${isActive('/collaborator/downloads')}`}>
                            <Download size={20} />
                            <span>Downloads</span>
                        </Link>
                        {hasPermission('manage_subaccounts') && (
                            <Link to="/collaborator/subaccounts" className={`nav-item ${isActive('/collaborator/subaccounts')}`}>
                                <Users size={20} />
                                <span>Subaccounts</span>
                            </Link>
                        )}
                    </div>

                    <div className="nav-group">
                        {hasPermission('view_billing') && (
                            <>
                                <Link to="/collaborator/wallet" className={`nav-item ${isActive('/collaborator/wallet')}`}>
                                    <Wallet size={20} />
                                    <span>My Wallet</span>
                                </Link>
                                <Link to="/collaborator/offers" className={`nav-item ${isActive('/collaborator/offers')}`}>
                                    <Tag size={20} />
                                    <span>Offers</span>
                                </Link>
                                <Link to="/collaborator/invoices" className={`nav-item ${isActive('/collaborator/invoices')}`}>
                                    <FileCheck size={20} />
                                    <span>Invoices</span>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="collaborator-content">
                <header className="content-header">
                    <h1>Collaborator Portal</h1>
                    {/* Add header actions here if needed */}
                </header>
                <div className="content-body">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CollaboratorLayout;
