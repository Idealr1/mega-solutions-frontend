import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logoFooter from '../assets/images/logo-footer.png';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                {/* Left Column: Logo & Text */}
                <div className="footer-col footer-left">
                    <img src={logoFooter} alt="Mega Solution" className="footer-logo" />
                    <p className="footer-desc">
                        Premium stone surfaces and custom cabinetry for kitchens, bathrooms, and homes that stand out.
                    </p>
                </div>

                {/* Middle Column: Home Links */}
                <div className="footer-col footer-middle">
                    <h3 className="footer-heading">Home</h3>
                    <ul className="footer-links">
                        <li><Link to="/products">products</Link></li>
                        <li><Link to="/about">about us</Link></li>
                        <li><Link to="/gallery">gallery</Link></li>
                        <li><Link to="/blog">blog</Link></li>
                        <li><Link to="/contact">contact us</Link></li>
                        <li><Link to="/b2b">b2b</Link></li>
                        <li><Link to="/login">login</Link></li>
                    </ul>
                </div>

                {/* Right Column: Contact Info */}
                <div className="footer-col footer-right">
                    <h3 className="footer-heading">Contact</h3>
                    <div className="footer-contact-info">
                        <p>
                            2040 Steel Dr, Suite A, E &amp; D<br />
                            Tucker, GA 30084
                        </p>
                        <p>
                            <a href="tel:+14702410524">+1 (470) 241-0524</a>
                        </p>
                        <p>
                            <a href="mailto:info@tkstoneandcabinets.com">info@tkstoneandcabinets.com</a>
                        </p>
                    </div>
                    <div className="footer-socials">
                        <Facebook size={24} />
                        <Instagram size={24} />
                        <Linkedin size={24} />
                    </div>
                </div>
            </div>
            {/* Bottom orange line matches screenshot bottom edge? Or is it a separate element? 
                Screenshot shows a thin orange line at the very bottom. 
                "all other links are 20px and bottom border colors are #EC4E15" - 
                The user might mean the headings or the active links? 
                "headers bottom border colors are #EC4E15" usually implies the title underline.
                The screenshot shows "Home" and "Contact" with an orange underline.
                And there is a long orange line at the bottom of the valid area.
            */}
            <div className="footer-bottom-line"></div>
        </footer>
    );
};

export default Footer;
