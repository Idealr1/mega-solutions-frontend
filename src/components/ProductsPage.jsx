import React from 'react';
import './ProductsPage.css';
import setfive from '../assets/images/setfive.png';
import ProductListing from './ProductListing';

const ProductsPage = () => {
    return (
        <>
            <div className="products-page">
                <div className="products-image-container">
                    <img src={setfive} alt="Cabinetry" className="products-hero-img" />
                </div>

                <div className="products-content-container">
                    <div className="products-text-wrapper">
                        <h1 className="products-title">
                            <strong>Cabinetry</strong> That<br />
                            Transforms Spaces
                        </h1>
                        <p className="products-desc">
                            Style meets function with cabinets built to elevate your kitchen.
                            Thoughtfully designed, expertly crafted—made to fit the heart of your home.
                        </p>
                    </div>
                </div>
            </div>
            <ProductListing />
        </>
    );
};

export default ProductsPage;
