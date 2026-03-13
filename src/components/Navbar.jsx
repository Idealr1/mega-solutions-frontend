import React, { useState } from 'react';
import { User, Heart, ShoppingCart, Search, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import './Navbar.css';

// Logo is now in src/assets/images/logo.png
import logoImage from '../assets/images/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, wishlist, openCart, openWishlist } = useCart();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* Mobile Toggle Button */}
      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Desktop Links (Hidden on Mobile) */}
      <div className={`navbar-links ${isMenuOpen ? 'mobile-hidden' : ''}`}>
        <NavLink to="/products" className="nav-link">products</NavLink>
        <NavLink to="/about" className="nav-link">about us</NavLink>
        <NavLink to="/gallery" className="nav-link">gallery</NavLink>
        <NavLink to="/blog" className="nav-link">blog</NavLink>
        <NavLink to="/contact" className="nav-link">contact us</NavLink>
      </div>

      {/* Logo Center */}
      <div className="navbar-logo">
        <Link to="/">
          <img src={logoImage} alt="Mega Solutions" className="logo-img" />
        </Link>
      </div>

      {/* Desktop Actions (Hidden on Mobile) */}
      <div className={`navbar-actions ${isMenuOpen ? 'mobile-hidden' : ''}`}>
        {user ? (
          <UserMenu />
        ) : (
          <Link to="/login" className="action-icon"><User size={20} /></Link>
        )}
        <div className="action-icon-wrapper" onClick={openWishlist}>
          <Heart size={20} className="action-icon" />
          {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
        </div>
        <div className="action-icon-wrapper" onClick={openCart}>
          <ShoppingCart size={20} className="action-icon" />
          {cart.length > 0 && <span className="nav-badge">{cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}</span>}
        </div>
        <Link to="/search" className="action-icon"><Search size={20} /></Link>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-links">
          <Link to="/products" className="nav-link" onClick={toggleMenu}>products</Link>
          <Link to="/about" className="nav-link" onClick={toggleMenu}>about us</Link>
          <Link to="/gallery" className="nav-link" onClick={toggleMenu}>gallery</Link>
          <Link to="/blog" className="nav-link" onClick={toggleMenu}>blog</Link>
          <Link to="/contact" className="nav-link" onClick={toggleMenu}>contact us</Link>
        </div>
        <div className="mobile-menu-actions">
          <Link to="/account" className="action-icon" onClick={toggleMenu}><User size={24} /></Link>
          <div className="action-icon-wrapper" onClick={() => { openWishlist(); toggleMenu(); }}>
            <Heart size={24} className="action-icon" />
            {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </div>
          <div className="action-icon-wrapper" onClick={() => { openCart(); toggleMenu(); }}>
            <ShoppingCart size={24} className="action-icon" />
            {cart.length > 0 && <span className="nav-badge">{cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}</span>}
          </div>
          <Link to="/search" className="action-icon" onClick={toggleMenu}><Search size={24} /></Link>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
