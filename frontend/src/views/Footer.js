import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li>Blog Posts</li>
            <li>Contact</li>
            <li>Checklists</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Cleaning Services</h3>
          <ul>
            <li>House Cleaning</li>
            <li>Condo Cleaning</li>
            <li>Apartment Cleaning</li>
            <li>Deep Cleaning</li>
            <li>Move Cleaning</li>
            <li>Post Construction</li>
            <li>Vacation Rental Cleaning</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Location Services</h3>
          <ul>
            <li>Toronto</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Contact Information</h3>
          <ul>
            <li><i className="bi bi-geo-alt-fill"></i> Brampton, Ontario, Canada</li>
            <li>
              <a href="tel:+1(647)913-7817">
                <i className="bi bi-telephone-fill"></i> +1(647)913-7817
              </a>
            </li>
            <li><i className="bi bi-envelope-fill"></i>lovelyserenitycorp@email.com</li>
            <li><i className="bi bi-clock-fill"></i> Mon-Sun 9 AM - 5 PM</li>
          </ul>
        </div>
      </div>

      <div className="copyright">
        <p>Copyright &copy; {new Date().getFullYear()} Lovely Serenity Corporation. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;