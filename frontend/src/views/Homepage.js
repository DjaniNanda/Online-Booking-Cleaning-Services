"use client"

import React, { useEffect, useState } from "react"
import { Home, Building, Briefcase, Droplet, Hammer, Truck, Plane, ArrowRight } from "lucide-react"
import "./Homepage.css"
import Slider from "./Slider"
import whip from'./images/9.jpeg';

export default function Homepage() {
  // State for section visibility tracking
  const [visibleSections, setVisibleSections] = useState({})

  // Simulate the useLocation hook from react-router-dom
  const useLocation = () => {
    return { state: null }
  }

  const location = useLocation()

  useEffect(() => {
    // Check if we have a scrollTo parameter in the state
    if (location.state && location.state.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100) // Small delay to ensure component is mounted
    }

    // Set up intersection observer for animations
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }))
        }
      })
    }, observerOptions)

    // Observe all sections
    const sections = document.querySelectorAll("section[id]")
    sections.forEach((section) => {
      sectionObserver.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        sectionObserver.unobserve(section)
      })
    }
  }, [location])

  // Cleaning categories and tasks for the checklist
  const cleaningData = {
    KITCHEN: [
      { task: "Clean Countertops", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Dust countertop items", recurring: true, deep: true, move: "N/A", post: true, vacation: true },
      { task: "Clean appliance exterior/sides", recurring: true, deep: true, move: true, post: true, vacation: true },
      {
        task: "Clean out interior (Fridge)",
        recurring: "Add-on",
        deep: "Add-on",
        move: true,
        post: "Add-on",
        vacation: "Add-on",
      },
      {
        task: "Clean refrigerator interior (Drawers)",
        recurring: "Add-on",
        deep: "Add-on",
        move: true,
        post: "Add-on",
        vacation: "Add-on",
      },
      { task: "Take apart elements", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Wipe cabinet fronts", recurring: false, deep: true, move: true, post: true, vacation: false },
      {
        task: "Clean inside cabinets & drawers",
        recurring: false,
        deep: false,
        move: true,
        post: "Add-on",
        vacation: false,
      },
      { task: "Sanitize sink, wash fixtures", recurring: true, deep: true, move: true, post: true, vacation: true },
    ],
    BATHROOMS: [
      { task: "Scrub tub/shower, wash fixtures", recurring: true, deep: true, move: true, post: true, vacation: true },
      {
        task: "Clean countertops and bathroom items",
        recurring: true,
        deep: true,
        move: true,
        post: true,
        vacation: true,
      },
      {
        task: "Clean inside cabinets & drawers",
        recurring: false,
        deep: false,
        move: true,
        post: "Add-on",
        vacation: false,
      },
      { task: "Sanitize sink, wash fixtures", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Clean mirrors", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Sanitize toilet and toilet area", recurring: true, deep: true, move: true, post: true, vacation: true },
    ],
    BEDROOMS: [
      { task: "Change bed, make beds", recurring: false, deep: false, move: "N/A", post: "N/A", vacation: true },
    ],
    "ALL ROOMS": [
      { task: "Remove cobwebs", recurring: true, deep: true, move: true, post: true, vacation: true },
      {
        task: "Dust ceiling fans and light fixtures",
        recurring: true,
        deep: true,
        move: true,
        post: true,
        vacation: true,
      },
      { task: "Dust tops", recurring: true, deep: true, move: "N/A", post: true, vacation: true },
      { task: "Dust mid-level and lamps", recurring: true, deep: true, move: "N/A", post: true, vacation: true },
      {
        task: "Dust furniture, polish wood furniture",
        recurring: true,
        deep: true,
        move: "N/A",
        post: true,
        vacation: true,
      },
      { task: "Dust blinds", recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: "Dust window sill", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Wash Window-Out", recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: "Dust stairs and stair railings", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Wash stairs and stair frames", recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: "Dust baseboards", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Wash Baseboards", recurring: false, deep: true, move: true, post: true, vacation: false },
      {
        task: "Empty trash and recycle trash cans",
        recurring: true,
        deep: true,
        move: true,
        post: true,
        vacation: true,
      },
      { task: "Vacuum Floors", recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: "Mop Hard Surface Floors", recurring: true, deep: true, move: true, post: true, vacation: true },
    ],
  }

  // Helper function to render check or x based on value
  const renderStatus = (value) => {
    if (value === true) {
      return <div className="text-center">✓</div>
    } else if (value === false) {
      return <div className="text-center">✕</div>
    } else if (value === "Add-on") {
      return <div className="text-center text-xs">Add-on</div>
    } else {
      return <div className="text-center text-xs">{value}</div>
    }
  }

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section id="hero-section" className={`hero-section ${visibleSections["hero-section"] ? "visible" : ""}`}>
        <div className="hero-content">
          <h1 className="hero-title">Luxury Clean – More Time for What Matters.</h1>
          <div className="hero-divider"></div>
          <div className="hero-subtitle">
            <p>A premium cleaning service designed for those who value their time.</p>
            <p>We handle the cleaning, so you can focus on what truly matters—family, career, and relaxation.</p>
          </div>
          <button
            className="cta-button"
            onClick={() => {
              window.location.href = "/bookingform"
            }}
          >
            Book Your Service
          </button>
        </div>
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="arrow-down">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials-section"
        className={`testimonials-section ${visibleSections["testimonials-section"] ? "visible" : ""}`}
      >
        <Slider />
      </section>

      {/* About Section */}
      <section id="about-section" className={`about-section ${visibleSections["about-section"] ? "visible" : ""}`}>
        <div className="about-content">
          <div className="about-text">
            <h1>Ready To Let The Professionals Do The Cleaning?</h1>
            <p>
              For more than 10 years Lovely Serenity Corp has been the most trusted provider of house cleaning and maid
              services across Ontario, Canada.
            </p>
            <p>
              We know that everyone has been cooped up and doing the best they can to keep their house clean. But, at
              some point you realize it's time to let the professionals take over. If you're tired of the never-ending
              chore of keeping the house clean and we're here to relieve you of that stress.
            </p>
            <p>
              Our professional house cleaning technicians know how to clean your Ontario home as only experts can. Give
              us a call today. We're ready to check house cleaning off your to-do list!
            </p>
          </div>
          <div className="about-image">
            <img id="one" src={whip} alt="Professional cleaning" />
          </div>
        </div>
        <div className="cta-container">
          <button
            id="booknow"
            className="book-now-button"
            onClick={() => {
              window.location.href = "/bookingform"
            }}
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services-section"
        className={`services-section ${visibleSections["services-section"] ? "visible" : ""}`}
      >
        <h2 className="services-title">Professional House Cleaning and Maid Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <Home className="service-icon" />
            <p>House Cleaning Services</p>
          </div>
          <div className="service-card">
            <Building className="service-icon" />
            <p>Condo Cleaning Services</p>
          </div>
          <div className="service-card">
            <Briefcase className="service-icon" />
            <p>Apartment Cleaning Services</p>
          </div>
          <div className="service-card">
            <Droplet className="service-icon" />
            <p>Deep(One-Time) Cleaning Services</p>
          </div>
          <div className="service-card">
            <Hammer className="service-icon" />
            <p>Post Construction Cleaning</p>
          </div>
          <div className="service-card">
            <Truck className="service-icon" />
            <p>Move Cleaning Services</p>
          </div>
          <div className="service-card">
            <Plane className="service-icon" />
            <p>Vacation Rental Cleaning</p>
          </div>
          <div className="service-card learn-more">
            <p>Learn More</p>
            <ArrowRight className="service-icon" />
          </div>
        </div>
      </section>

      {/* Cleaning Checklist Section */}
      <section
        id="cleaning-checklist-section"
        className={`cleaning-checklist-section ${visibleSections["cleaning-checklist-section"] ? "visible" : ""}`}
      >
        <h2 className="checklist-title">Cleaning Checklist</h2>

        <div className="checklist-container">
          <table className="checklist-table">
            <thead>
              <tr>
                <th className="task-column"></th>
                <th className="service-column">Recurring House Cleaning</th>
                <th className="service-column">Deep(One-Time) Cleaning</th>
                <th className="service-column">Move Cleaning</th>
                <th className="service-column">Post Construction Cleaning</th>
                <th className="service-column">Vacation Rental Cleaning</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cleaningData).map(([category, tasks]) => (
                <React.Fragment key={category}>
                  <tr className="category-row">
                    <td colSpan={6}>{category}</td>
                  </tr>
                  {tasks.map((task, index) => (
                    <tr key={`${category}-${index}`} className="task-row">
                      <td className="task-name">{task.task}</td>
                      <td>{renderStatus(task.recurring)}</td>
                      <td>{renderStatus(task.deep)}</td>
                      <td>{renderStatus(task.move)}</td>
                      <td>{renderStatus(task.post)}</td>
                      <td>{renderStatus(task.vacation)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
