import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from './images/logo1.jpg';
import './Navbar.css';
import PopupForm from "./PopupForm.js";

function Navbar() {
    const [hovered, setHovered] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    // Get current location to check if we're on the booking form page
    const location = useLocation();
    // Update the path check to match your actual route
    const isBookingPage = location.pathname === '/bookingform' || location.pathname === '/bookingform/';
    
    // For debugging - you can remove this after confirming it works
    console.log("Current path:", location.pathname);
    console.log("Is booking page:", isBookingPage);
    
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    const handleMouseEnter = (index) => {
        setHovered(index);
        if (index === 4) {
            setDropdownOpen(true);
        }
    };

    const handleMouseLeave = () => {
        setHovered(null);
        setDropdownOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="navbar-wrapper">
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img src={logo} alt="Logo" />
                    </a>
                    
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        onClick={toggleMobileMenu}
                        aria-controls="navbarNav" 
                        aria-expanded={mobileMenuOpen} 
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className={`collapse navbar-collapse justify-content-end ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/register" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}>
                                    Reviews
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/login" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>
                                    About Us
                                </Link>
                            </li>
                            
                            <li className="nav-item " onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}>
                                <a
                                    className="nav-link "
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded={dropdownOpen}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    Services
                                </a>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/result" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>
                                    Checklists
                                </Link>
                            </li>
                                    <li className="nav-item cta-desktop">
                                        <button id='estimation' onClick={() => setIsPopupOpen(true)} className="open-btn">Get A Quote</button>
                                    </li>
                                    <li className="nav-item cta-desktop">
                                        <button id='book'>
                                            Book Now
                                        </button>
                                    </li>
                                    <li className="nav-item cta-desktop">
                                        <a href="tel:+1(647)913-7817">
                                            <button id='phone'>
                                                <i className="bi bi-telephone"></i> +1(647)913-7817
                                            </button>
                                        </a>
                                    </li>
                        </ul>
                    </div>

                    {/* Only show mobile buttons container if not on booking page */}
                    {!isBookingPage && (
                        <>
                            <div className="buttons-container">
                                <button id='button1' onClick={() => setIsPopupOpen(true)} className="open-btn">Get A Quote</button>
                                <button id="button2">Book Now</button>
                                <a href="tel:+1(647)913-7817">
                                    <button id="button3">Call</button>
                                </a>
                            </div>
                        </>
                    )}
                    <PopupForm isOpen={isPopupOpen} setIsOpen={setIsPopupOpen} />
                </div>
            </nav>
        </div>
    );
}

export default Navbar;