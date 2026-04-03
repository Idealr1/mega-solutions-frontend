import React from 'react';
import './OverlaySection.css';
import overlayBg from '../assets/images/imageoverlay.png';

const OverlaySection = () => {
    return (
        <div className="overlay-section" style={{ backgroundImage: `url(${overlayBg})` }}>
            <div className="overlay-content">
                <h2 className="overlay-header">
                    Start Your Home <br />
                    Transformation Today
                </h2>
                <p className="overlay-desc" style={{ maxWidth: '800px', margin: '0 auto 30px', fontSize: '16px', lineHeight: '1.6' }}>
                    Mega Solution stands as your trusted partner for premium natural and engineered stone surfaces, offering a curated selection designed to uplift every space. From luxurious countertops to elegant vanities, our extensive range features high-quality Granite, Quartz, Quartzite, Marble, Soapstone, and Porcelain. With over 200 SKUs from trusted global suppliers, we combine exceptional quality with competitive pricing. Committed to transforming your vision into reality, we provide not only outstanding materials but also expert service.
                </p>
                <button className="see-more-btn">see more</button>
            </div>
        </div>
    );
};

export default OverlaySection;
