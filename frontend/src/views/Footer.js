import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>Lovely Serenity</h2>
          <p className="footer-tagline">Professional Cleaning Services</p>
        </div>
        
        <div className="footer-content">
          <div className="footer-column">
            <h3>Cleaning Services</h3>
            <ul>
              <li><a href="#">House Cleaning</a></li>
              <li><a href="#">Condo Cleaning</a></li>
              <li><a href="#">Apartment Cleaning</a></li>
              <li><a href="#">Deep Cleaning</a></li>
              <li><a href="#">Move Cleaning</a></li>
              <li><a href="#">Post Construction</a></li>
              <li><a href="#">Vacation Rental Cleaning</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Location Services</h3>
            <ul>
              <li><a href="#">Toronto</a></li>
              <li><a href="#">Brampton</a></li>
              <li><a href="#">Mississauga</a></li>
              <li><a href="#">Service Areas</a></li>
            </ul>
          </div>
          
          <div className="footer-column contact-column">
            <h3>Contact Information</h3>
            <ul>
              <li>
                <i className="bi bi-geo-alt-fill"></i>
                <span>Brampton, Ontario, Canada</span>
              </li>
              <li>
                <a href="tel:+1(647)913-7817">
                  <i className="bi bi-telephone-fill"></i>
                  <span>+1 (647) 913-7817</span>
                </a>
              </li>
              <li>
                <a href="mailto:lovelyserenitycorp@gmail.com">
                  <i className="bi bi-envelope-fill"></i>
                  <span>lovelyserenitycorp@gmail.com</span>
                </a>
              </li>
              <li>
                <i className="bi bi-clock-fill"></i>
                <span>Mon-Sun 9 AM - 5 PM</span>
              </li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
            </div>
            <div className="newsletter">
              <h4>Subscribe to our newsletter</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Email address" />
                <button type="submit">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        <div className="copyright-container">
          <p>Copyright &copy; {new Date().getFullYear()} Lovely Serenity Corporation. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;