import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from './images/logo1.jpg';
import './Navbar.css';
import PopupForm from "./PopupForm.js";

function Navbar() {
    const [hovered, setHovered] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    // Get current location and navigator for routing
    const location = useLocation();
    const navigate = useNavigate();
    
    const isBookingPage = location.pathname === '/bookingform' || location.pathname === '/bookingform/';
    
    // Function to handle smooth scrolling to sections
    const scrollToSection = (sectionId) => {
        // If we're on the homepage, scroll to the section
        if (location.pathname === '/' || location.pathname === '') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If we're on another page, navigate to homepage and then scroll
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };
    
    // Check if we need to scroll to a section after navigation
    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            setTimeout(() => {
                const element = document.getElementById(location.state.scrollTo);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                // Clear the state to prevent unexpected scrolling
                window.history.replaceState({}, document.title);
            }, 100); // Small delay to ensure component is mounted
        }
    }, [location]);

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
    
    // Navigate to booking form
    const navigateToBookingForm = () => {
        navigate('/bookingform');
    };

    return (
        <div className="navbar-wrapper">
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
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
                                <Link 
                                    className="nav-link" 
                                    to="/" 
                                    onClick={(e) => { e.preventDefault(); navigate('/'); }} 
                                    onMouseEnter={() => handleMouseEnter(0)} 
                                    onMouseLeave={handleMouseLeave}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <a 
                                    className="nav-link" 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); scrollToSection('testimonials-section'); }} 
                                    onMouseEnter={() => handleMouseEnter(3)} 
                                    onMouseLeave={handleMouseLeave}
                                >
                                    Reviews
                                </a>
                            </li>
                            <li className="nav-item">
                                <a 
                                    className="nav-link" 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); scrollToSection('about-section'); }} 
                                    onMouseEnter={() => handleMouseEnter(1)} 
                                    onMouseLeave={handleMouseLeave}
                                >
                                    About Us
                                </a>
                            </li>
                            
                            {/* Modified Services link to fix the error */}
                            <li className="nav-item" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}>
                                <a
                                    className="nav-link"
                                    href="#"
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        scrollToSection('services-section'); 
                                    }}
                                >
                                    Services
                                </a>
                            </li>
                            <li className="nav-item">
                                <a 
                                    className="nav-link" 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); scrollToSection('cleaning-checklist-section'); }} 
                                    onMouseEnter={() => handleMouseEnter(2)} 
                                    onMouseLeave={handleMouseLeave}
                                >
                                    Checklists
                                </a>
                            </li>
                            <li className="nav-item cta-desktop">
                                <button id='estimation' onClick={() => setIsPopupOpen(true)} className="open-btn">Get A Quote</button>
                            </li>
                            <li className="nav-item cta-desktop">
                                <button id='book' onClick={navigateToBookingForm}>
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
                                <button id="button2" onClick={navigateToBookingForm}>Book Now</button>
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