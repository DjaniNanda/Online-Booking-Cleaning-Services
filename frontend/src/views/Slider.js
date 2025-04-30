"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import './Slider.css'
import Person1 from './images/3.jpeg'; 
import Person2 from './images/4.jpeg'; 
import Person3 from './images/5.jpeg'; 
import Person4 from './images/6.jpeg'; 
import Person5 from './images/7.jpeg'; 
import Person6 from './images/8.jpeg';

const TestimonialsSlider = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

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
      image: Person3,
    },
    {
      name: "David Johnson",
      location: "Vancouver, BC",
      text: "Moving is stressful enough, and their move-in cleaning service was a lifesaver. They cleaned every nook and cranny of my new apartment. Professional, efficient, and incredibly detailed.",
      rating: 5,
      image: Person4,
    },
    {
      name: "Rachel Green",
      location: "Hamilton, ON",
      text: "I've been using Lovely Serenity for over a year now, and I'm consistently impressed. Their consistency is remarkable. Whether it's a regular cleaning or a deep clean, they always exceed my expectations.",
      rating: 5,
      image: Person5,
    },
    {
      name: "Steven Owen",
      location: "Ontario, ON",
      text: "At the beginning I was not sure, but after my first deep cleaning I decided to take recurring cleaning from Lovely Serenity. Their work is very professional, efficient, and incredibly detailed.",
      rating: 5,
      image: Person6,
    },
  ]

  // Calculate the total number of pages (each page shows 2 testimonials)
  const totalPages = Math.ceil(testimonials.length / 2)

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isAnimating) {
        handleNext()
      }
    }, 20000) // Change slide every 20 seconds

    return () => clearInterval(slideInterval)
  }, [totalPages, isAnimating])

  // Manual navigation
  const handlePrevious = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))

    setTimeout(() => {
      setIsAnimating(false)
    }, 600) // Match this with CSS transition duration
  }

  const handleNext = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setCurrentPage((prev) => (prev + 1) % totalPages)

    setTimeout(() => {
      setIsAnimating(false)
    }, 600) // Match this with CSS transition duration
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index < rating ? "filled" : "empty"}`}>
        ★
      </span>
    ))
  }

  // Get the current two testimonials to display
  const startIndex = currentPage * 2
  const currentTestimonials = testimonials.slice(startIndex, startIndex + 2)

  // If we're on the last page and have an odd number of testimonials, we might only have one
  // So we pad with an empty testimonial if needed
  if (currentTestimonials.length === 1) {
    currentTestimonials.push(null)
  }

  return (
    <div className="testimonials-slider">
      <h1 className="testimonials-title">What Our Customers Say</h1>
      <div className="testimonial-container">
        <button
          className="nav-button prev"
          onClick={handlePrevious}
          disabled={isAnimating}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="testimonials-wrapper">
          {currentTestimonials.map((testimonial, index) =>
            testimonial ? (
              <div
                className={`testimonial ${isAnimating ? "animating" : ""}`}
                key={startIndex + index}
                style={{ "--index": index }}
              >
                <div className="testimonial-profile">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={`${testimonial.name} profile`}
                    className="profile-image"
                  />
                </div>
                <div className="testimonial-content">
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-details">
                    <div className="rating">{renderStars(testimonial.rating)}</div>
                    <h3>{testimonial.name}</h3>
                    <p className="location">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="testimonial empty" key="empty"></div>
            ),
          )}
        </div>

        <button className="nav-button next" onClick={handleNext} disabled={isAnimating} aria-label="Next testimonial">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="testimonial-dots">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentPage ? "active" : ""}`}
            onClick={() => {
              if (!isAnimating && index !== currentPage) {
                setIsAnimating(true)
                setCurrentPage(index)
                setTimeout(() => {
                  setIsAnimating(false)
                }, 600)
              }
            }}
            aria-label={`Go to testimonial page ${index + 1}`}
            disabled={isAnimating}
          >
            ●
          </button>
        ))}
      </div>
    </div>
  )
}

export default TestimonialsSlider
