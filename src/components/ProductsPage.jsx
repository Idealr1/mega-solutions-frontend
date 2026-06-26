import React from 'react';
import { useSearchParams } from 'react-router-dom';
import './ProductsPage.css';
import setfive from '../assets/images/setfive.png';
import ProductListing from './ProductListing';
import StonesListing from './StonesListing';

const ProductsPage = () => {
    // Active tab lives in the URL so a) deep links work (?tab=stones)
    // b) browser-back from a stone/product detail returns to the right tab.
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') === 'stones') ? 'stones' : 'cabinets';

    const switchTo = (tab) => {
        // Don't clutter history when switching tabs (replace instead of push)
        if (tab === 'cabinets') setSearchParams({}, { replace: true });
        else setSearchParams({ tab }, { replace: true });
    };

    return (
        <>
            <div className="products-page">
                <div className="products-image-container">
                    <img src={setfive} alt="Cabinetry" className="products-hero-img" />
                </div>

                <div className="products-content-container">
                    <div className="products-text-wrapper">
                        <h1 className="products-title">
                            <strong>{activeTab === 'cabinets' ? 'Cabinetry' : 'Stones'}</strong> That<br />
                            Transforms Spaces
                        </h1>
                        <p className="products-desc">
                            {activeTab === 'cabinets'
                                ? 'Style meets function with cabinets built to elevate your kitchen. Thoughtfully designed, expertly crafted—made to fit the heart of your home.'
                                : 'Premium natural and engineered stone surfaces — quartz, granite, marble, and quartzite — for countertops, walls, and flooring that last a lifetime.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="products-tabs">
                <button
                    className={`products-tab ${activeTab === 'cabinets' ? 'active' : ''}`}
                    onClick={() => switchTo('cabinets')}
                >
                    Cabinets
                </button>
                <button
                    className={`products-tab ${activeTab === 'stones' ? 'active' : ''}`}
                    onClick={() => switchTo('stones')}
                >
                    Stones
                </button>
            </div>

            {activeTab === 'cabinets' ? <ProductListing /> : <StonesListing />}
        </>
    );
};

export default ProductsPage;
