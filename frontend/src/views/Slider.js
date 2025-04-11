import React, { useState, useEffect } from 'react';
import './Slider.css'
import Person1 from './images/3.jpeg';
import Person2 from './images/4.jpeg';
import Person3 from './images/5.jpeg';
import Person4 from './images/6.jpeg';
import Person5 from './images/7.jpeg';
import Person6 from './images/8.jpeg';

const TestimonialsSlider = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const testimonials = [
    {
      name: "Sarah Thompson",
      location: "Toronto, ON",
      text: "Lovely Serenity Corp transformed my home! Their attention to detail is incredible. Every corner was spotless, and they were so professional and friendly. I'll definitely be using their services again.",
      rating: 5,
      image: Person1  
    },
    {
      name: "Michael Rodriguez",
      location: "Mississauga, ON",
      text: "As a busy professional, I can't thank Lovely Serenity enough. They've made my life so much easier. The deep cleaning service is worth every penny. My condo has never looked better!",
      rating: 5,
      image: Person2
    },
    {
      name: "Emily Chen",
      location: "Ottawa, ON",
      text: "I was skeptical about hiring a cleaning service, but Lovely Serenity completely won me over. They were punctual, thorough, and handled my post-renovation cleanup perfectly. Highly recommended!",
      rating: 4,
      image: Person3
    },
    {
      name: "David Johnson",
      location: "Vancouver, BC",
      text: "Moving is stressful enough, and their move-in cleaning service was a lifesaver. They cleaned every nook and cranny of my new apartment. Professional, efficient, and incredibly detailed.",
      rating: 5,
      image: Person4
    },
    {
      name: "Rachel Green",
      location: "Hamilton, ON",
      text: "I've been using Lovely Serenity for over a year now, and I'm consistently impressed. Their consistency is remarkable. Whether it's a regular cleaning or a deep clean, they always exceed my expectations.",
      rating: 5,
      image: Person5
    },
    {
      name: "steven owen",
      location: "Ontario,ON ",
      text: "At The Begining I Was Not Sure But My First Deep Cleaning I Decided To Take Recuring Cleaning From Lovely Serenity .Their Work Is Very Professional, efficient, and incredibly detailed.",
      rating: 5,
      image: Person6
    }
  ];

  // Calculate the total number of pages (each page shows 2 testimonials)
  const totalPages = Math.ceil(testimonials.length / 2);

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentPage((prev) => 
        (prev + 1) % totalPages
      );
    }, 20000); // Change slide every 20 seconds

    return () => clearInterval(slideInterval);
  }, [totalPages]);

  // Manual navigation
  const handlePrevious = () => {
    setCurrentPage((prev) => 
      prev === 0 ? totalPages - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentPage((prev) => 
      (prev + 1) % totalPages
    );
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span 
        key={index} 
        style={{ 
          color: index < rating ? 'gold' : 'gray',
          fontSize: '24px'
        }}
      >
        ★
      </span>
    ));
  };

  // Get the current two testimonials to display
  const startIndex = currentPage * 2;
  const currentTestimonials = testimonials.slice(startIndex, startIndex + 2);
  
  // If we're on the last page and have an odd number of testimonials, we might only have one
  // So we pad with an empty testimonial if needed
  if (currentTestimonials.length === 1) {
    currentTestimonials.push(null);
  }

  return (
    <div className="testimonials-slider">
      <h1>Customer Reviews</h1>
      <div className="testimonial-container">
        <button 
          className="nav-button prev" 
          onClick={handlePrevious}
        >
          &#10094;
        </button>
        
        <div className="testimonials-wrapper">
          {currentTestimonials.map((testimonial, index) => (
            testimonial ? (
              <div className="testimonial" key={startIndex + index}>
                <div className="testimonial-profile">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name} profile`} 
                    className="profile-image"
                  />
                </div>
                <p>"{testimonial.text}"</p>
                <div className="testimonial-details">
                  <div className="rating">
                    {renderStars(testimonial.rating)}
                  </div>
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.location}</p>
                </div>
              </div>
            ) : (
              <div className="testimonial empty" key="empty"></div>
            )
          ))}
        </div>
        
        <button 
          className="nav-button next" 
          onClick={handleNext}
        >
          &#10095;
        </button>
      </div>
      
      <div className="testimonial-dots">
        {[...Array(totalPages)].map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          >
            ●
          </span>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSlider;