import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import CartDrawer from './CartDrawer';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
            <ScrollToTop />
            <CartDrawer />
        </div>
    );
};

export default MainLayout;
