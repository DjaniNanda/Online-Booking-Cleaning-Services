import React from 'react';
import './Homepage.css';
import Slider from './Slider';
import whip from './images/9.jpeg';

function Homepage() {

  // Cleaning categories and tasks for the checklist
  const cleaningData = {
    'KITCHEN': [
      { task: 'Clean Countertops', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Dust countertop items', recurring: true, deep: true, move: 'N/A', post: true, vacation: true },
      { task: 'Clean appliance exterior/sides', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Clean out interior (Fridge)', recurring: 'Add-on', deep: 'Add-on', move: true, post: 'Add-on', vacation: 'Add-on' },
      { task: 'Clean refrigerator interior (Drawers)', recurring: 'Add-on', deep: 'Add-on', move: true, post: 'Add-on', vacation: 'Add-on' },
      { task: 'Take apart elements', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Wipe cabinet fronts', recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: 'Clean inside cabinets & drawers', recurring: false, deep: false, move: true, post: 'Add-on', vacation: false },
      { task: 'Sanitize sink, wash fixtures', recurring: true, deep: true, move: true, post: true, vacation: true }
    ],
    'BATHROOMS': [
      { task: 'Scrub tub/shower, wash fixtures', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Clean countertops and bathroom items', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Clean inside cabinets & drawers', recurring: false, deep: false, move: true, post: 'Add-on', vacation: false },
      { task: 'Sanitize sink, wash fixtures', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Clean mirrors', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Sanitize toilet and toilet area', recurring: true, deep: true, move: true, post: true, vacation: true }
    ],
    'BEDROOMS': [
      { task: 'Change bed, make beds', recurring: false, deep: false, move: 'N/A', post: 'N/A', vacation: true }
    ],
    'ALL ROOMS': [
      { task: 'Remove cobwebs', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Dust ceiling fans and light fixtures', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Dust tops', recurring: true, deep: true, move: 'N/A', post: true, vacation: true },
      { task: 'Dust mid-level and lamps', recurring: true, deep: true, move: 'N/A', post: true, vacation: true },
      { task: 'Dust furniture, polish wood furniture', recurring: true, deep: true, move: 'N/A', post: true, vacation: true },
      { task: 'Dust blinds', recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: 'Dust window sill', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Wash Window-Out', recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: 'Dust stairs and stair railings', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Wash stairs and stair frames', recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: 'Dust baseboards', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Wash Baseboards', recurring: false, deep: true, move: true, post: true, vacation: false },
      { task: 'Empty trash and recycle trash cans', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Vacuum Floors', recurring: true, deep: true, move: true, post: true, vacation: true },
      { task: 'Mop Hard Surface Floors', recurring: true, deep: true, move: true, post: true, vacation: true }
    ]
  };

  // Helper function to render check or x based on value
  const renderStatus = (value) => {
    if (value === true) {
      return <div className="text-center">✓</div>;
    } else if (value === false) {
      return <div className="text-center">✕</div>;
    } else if (value === 'Add-on') {
      return <div className="text-center text-xs">Add-on</div>;
    } else {
      return <div className="text-center text-xs">{value}</div>;
    }
  };

  return (
    <div className="homepage-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Luxury Clean – More Time for What Matters.</h1>
          <div className="hero-divider"></div>
          <div className="hero-subtitle">
            <p>A premium cleaning service designed for those who value their time.</p>        
            <p>We handle the cleaning, so you can focus on what truly matters—family, career, and relaxation.</p>
          </div>
          <button className="cta-button">Book Your Service</button>
        </div>
      </section>
      <section className="testimonials-section five">
        <Slider />
      </section>
      <section className="about-section third">
        <div className="about-content">
          <div className="about-text">
            <h1>Ready To Let The Professionals Do The Cleaning?</h1>
            <p>For more then 10 years Lovely Serenity Corp has been the most trusted provider of house cleaning and maid services across Ontario, Canada.</p>
            <p>We know that everyone has been cooped up and doing the best they can to keep their house clean. But, at some point you realize it's time to let the professionals take over. If you're tired of the never-ending chore of keeping the house clean and we're here to relieve you of that stress.</p>
            <p>Our professional house cleaning technicians know how to clean your Ontario home as only experts can. Give us a call today. We're ready to check house cleaning off your to-do list!</p>
          </div>
          <div className="about-image">
            <img id="one" src={whip} alt="Professional cleaning" />
          </div>
        </div>
        <div className="cta-button">
          <a href="#">
            <button id="booknow">Book Now</button>
          </a>
        </div>
      </section>

      <section className="services-section fourth">
        <h2 className="services-title">Professional House Cleaning and Maid Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <i className="bi bi-house-door-fill"></i>
            <p>House Cleaning Services</p>
          </div>
          <div className="service-card">
            <i className="bi bi-building"></i>
            <p>Condo Cleaning Services</p>
          </div>
          <div className="service-card">
            <i className="fa-solid fa-building"></i>
            <p>Apartment Cleaning Services</p>
          </div>
          <div className="service-card">
            <i className="fa-solid fa-bucket"></i>
            <p>Deep(One-Time) Cleaning Services</p>
          </div>
          <div className="service-card">
            <i className="bi bi-hammer"></i>
            <p>Post Construction Cleaning</p>
          </div>
          <div className="service-card">
            <i className="bi bi-truck"></i>
            <p>Move Cleaning Services</p>
          </div>
          <div className="service-card">
            <i className="bi bi-airplane"></i>
            <p>Vacation Rental Cleaning</p>
          </div>
          <div className="service-card learn-more">
            <p>Learn More</p>
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
      </section>

      <section className="cleaning-checklist-section" >
        <h2 className="services-title" style={{ marginBottom: '30px', textAlign: 'center' }}>
          Cleaning Checklist
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="p-2 text-left" style={{ width: '30%', padding: '10px', textAlign: 'left' }}></th>
                <th 
                  className="p-2 text-center" 
                  style={{ 
                    backgroundColor: 'rgb(253, 219, 26)', 
                    color: 'black', 
                    padding: '10px', 
                    textAlign: 'center' 
                  }}
                >
                  Recurring House Cleaning
                </th>
                <th 
                  className="p-2 text-center" 
                  style={{ 
                    backgroundColor: 'rgb(253, 219, 26)', 
                    color: 'black', 
                    padding: '10px', 
                    textAlign: 'center' 
                  }}
                >
                  Deep(One-Time) Cleaning
                </th>
                <th 
                  className="p-2 text-center" 
                  style={{ 
                    backgroundColor: 'rgb(253, 219, 26)', 
                    color: 'black', 
                    padding: '10px', 
                    textAlign: 'center' 
                  }}
                >
                  Move Cleaning
                </th>
                <th 
                  className="p-2 text-center" 
                  style={{ 
                    backgroundColor: 'rgb(253, 219, 26)', 
                    color: 'black', 
                    padding: '10px', 
                    textAlign: 'center' 
                  }}
                >
                  Post Construction Cleaning
                </th>
                <th 
                  className="p-2 text-center" 
                  style={{ 
                    backgroundColor: 'rgb(253, 219, 26)', 
                    color: 'black', 
                    padding: '10px', 
                    textAlign: 'center' 
                  }}
                >
                  Vacation Rental Cleaning
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cleaningData).map(([category, tasks]) => (
                <React.Fragment key={category}>
                  <tr>
                    <td 
                      colSpan="6" 
                      className="p-2 font-bold" 
                      style={{ 
                        padding: '13px', 
                        fontWeight: 'bold',
                        color: 'white' 
                      }}
                    >
                      {category}
                    </td>
                  </tr>
                  {tasks.map((task, index) => (
                    <tr key={`${category}-${index}`} style={{ borderTop: '1px solid #444' }}>
                      <td className="p-2" style={{ padding: '10px' }}>{task.task}</td>
                      <td className="p-2" style={{ padding: '10px', textAlign: 'center' }}>{renderStatus(task.recurring)}</td>
                      <td className="p-2" style={{ padding: '10px', textAlign: 'center' }}>{renderStatus(task.deep)}</td>
                      <td className="p-2" style={{ padding: '10px', textAlign: 'center' }}>{renderStatus(task.move)}</td>
                      <td className="p-2" style={{ padding: '10px', textAlign: 'center' }}>{renderStatus(task.post)}</td>
                      <td className="p-2" style={{ padding: '10px', textAlign: 'center' }}>{renderStatus(task.vacation)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
    </div>
  );
}

export default Homepage;