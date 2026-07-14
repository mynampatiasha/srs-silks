import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">SRS Silk Traders</div>
          <p>
            Chickpet, Bengaluru's trusted name in premium silk sarees for over three decades.
            Authentic Kanjeevaram silks, 9-yard sarees, and wedding collections — crafted with
            honest pricing and personal care.
          </p>
          <div className="footer-badges">
            <span>✓ Authentic Silk</span>
            <span>✓ 30+ Years Trusted</span>
            <span>✓ 4.7★ Rated</span>
          </div>
        </div>

        <div className="footer-links">
          <strong>Quick Links</strong>
          <a href="/#collection">Collection</a>
          <a href="/#gallery">Gallery</a>
          <a href="/#reviews">Reviews</a>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-contact">
          <strong>Get In Touch</strong>
          <p>
            1st Floor, Murugan Building, Sriram Market, No. 510/A, Avenue Rd,
            beside Davanam Jewels, Kumbarpet, Chickpet, Bengaluru, Karnataka 560002
          </p>
          <p><a href="tel:+919341218059">093412 18059</a></p>
          <p>Open Daily: 10:00 AM – 6:30 PM</p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
            <a href="https://wa.me/919341218059" target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ color: '#25D366', fontSize: '20px' }}>
              <i className="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://www.instagram.com/srs_silk_traders1/" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px' }}>
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.youtube.com/results?search_query=srs+silk+traders" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px' }}>
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a href="https://maps.app.goo.gl/4oxGpcFzTDHLTkDWA" target="_blank" rel="noopener noreferrer" title="Find us on Maps" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px' }}>
              <i className="fa-solid fa-location-dot"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 SRS Silk Traders. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
