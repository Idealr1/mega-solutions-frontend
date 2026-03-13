import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // Cart Logic
    const openCart = () => {
        setIsCartOpen(true);
        setIsWishlistOpen(false);
    };

    const closeCart = () => setIsCartOpen(false);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.name === product.name);
            if (existing) {
                return prev.map(item =>
                    item.name === product.name
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        openCart();
    };

    const removeFromCart = (productName) => {
        setCart(prev => prev.filter(item => item.name !== productName));
    };

    const clearCart = () => setCart([]);

    const updateQuantity = (productName, change) => {
        setCart(prev => prev.map(item => {
            if (item.name === productName) {
                const newQty = Math.max(1, (item.quantity || 1) + change);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((total, item) => {
        // Safe parse: handles numbers or strings like "$320.00"
        const rawPrice = item.price;
        const processedPrice = typeof rawPrice === 'string'
            ? parseFloat(rawPrice.replace(/[$,]/g, ''))
            : parseFloat(rawPrice);

        return total + (processedPrice * (item.quantity || 1));
    }, 0);

    // Wishlist Logic
    const openWishlist = () => {
        setIsWishlistOpen(true);
        setIsCartOpen(false);
    };

    const closeWishlist = () => setIsWishlistOpen(false);

    const addToWishlist = (product) => {
        setWishlist(prev => {
            if (!prev.find(item => item.name === product.name)) {
                return [...prev, product];
            }
            return prev;
        });
        openWishlist();
    };

    const removeFromWishlist = (productName) => {
        setWishlist(prev => prev.filter(item => item.name !== productName));
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart, updateQuantity, cartTotal, isCartOpen, openCart, closeCart,
            wishlist, addToWishlist, removeFromWishlist, isWishlistOpen, openWishlist, closeWishlist
        }}>
            {children}
        </CartContext.Provider>
    );
};
