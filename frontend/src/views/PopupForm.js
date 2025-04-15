import React, { useState } from 'react';
import './PopupForm.css';

function PopupForm({ isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    frequency: "weekly",
    squarefeet: "0 – 500 Sq Ft",
    bedroom: "1",
    bathroom: "1",
    // Add-ons
    deluxe_cleaning: false,
    heavy_duty: false,
    inside_fridge: 0,
    inside_oven: 0,
    inside_cabinets: false,
    load_dishwasher: false,
    handwash_dishes: false,
    laundry_folding: 0,
    eco_friendly: false,
    pet_hair_fee: false,
    change_linen: false,
  });

  const [price, setPrice] = useState(null);

   // Get the appropriate base URL from environment variables
   const baseUrl = process.env.NODE_ENV === 'development' 
  ? (process.env.REACT_APP_API_BASE_URL_LOCAL || 'http://localhost:8000')
  : (process.env.REACT_APP_API_BASE_URL_DEPLOY || 'https://lovelyserenitybackend.onrender.com');

  // Handle form input change
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle number input change
  const handleNumberChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  // Get price estimate
  const getPrice = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/price-estimate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setPrice(result.price);
      }
    } catch (error) {
      console.error('Error getting price estimate:', error);
    }
  };

  // handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Send form data to Django backend
      const response = await fetch(`${baseUrl}/api/quote-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Success:', result);
        // Close the popup or show success message
        setIsOpen(false);
        // You might want to show a success message to the user
      } else {
        console.error('Error:', result);
        // Handle validation errors or other issues
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle network errors
    }
  };

  // Handle close button click
  const handleClose = () => {
    setIsOpen(false);
  };

  // If the popup is not open, return null to render nothing
  if (!isOpen) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <button 
          className="close-button" 
          onClick={handleClose}
          aria-label="Close form"
        >
          ×
        </button>
        
        <h2 className="form-title">Let's get started!</h2>

        <form onSubmit={handleSubmit}>
        <div className="form-row">
            <div className="form-group half">
              <label htmlFor="firstname">First Name*</label>
              <input
                type="text"
                id="firstName"
                name="firstname"
                placeholder="ex. Jane"
                value={formData.firstname}
                onChange={handleInputChange}
                maxLength={60}
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="lastname">Last Name*</label>
              <input
                type="text"
                id="lastName"
                name="lastname"
                placeholder="ex. Smith"
                value={formData.lastname}
                onChange={handleInputChange}
                maxLength={60}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ex. jane.smith@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                maxLength={100}
              />
            </div>
            <div className="form-group half">
              <label htmlFor="phone1">Phone number*</label>
              <input
                type="tel"
                id="phone1"
                name="phone"
                placeholder="ex. (555) 555-5555"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={16}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="frequency">Frequency*</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                required
              >
              
              <option value="weekly">Every 1 Week(discount 20%)</option>
              <option value="biweekly">Every 2 Week(discount 15%)</option>
              <option value="monthly">Every 4 Week(discount 10%)</option>
              <option value="onetime">One Time(Deep)</option>
              </select>
            </div>
            <div className="form-group half">
              <label htmlFor="squarefeet">Square Feet*</label>
              <select
                id="squarefeet"
                name="squarefeet"
                value={formData.squarefeet}
                onChange={handleInputChange}
                required
              >
                <option value="0 – 500 Sq Ft">0 – 500 Sq Ft</option>
                <option value="501 – 1000 Sq Ft">501 – 1000 Sq Ft</option>
                <option value="1001 – 1500 Sq Ft">1001 – 1500 Sq Ft</option>
                <option value="1501 – 2000 Sq Ft">1501 – 2000 Sq Ft</option>
                <option value="2001 – 2500 Sq Ft">2001 – 2500 Sq Ft</option>
                <option value="2501 – 3000 Sq Ft">2501 – 3000 Sq Ft</option>
                <option value="3001 – 3500 Sq Ft">3001 – 3500 Sq Ft</option>
                <option value="3501 – 4000 Sq Ft">3501 – 4000 Sq Ft</option>
                <option value="4001 – 4500 Sq Ft">4001 – 4500 Sq Ft</option>
                <option value="4501 – 5000 Sq Ft">4501 – 5000 Sq Ft</option>
                <option value="5001 – 5500 Sq Ft">5001 – 5500 Sq Ft</option>
                <option value="5501 – 6000 Sq Ft">5501 – 6000 Sq Ft</option>
                <option value="6001 – 6500 Sq Ft">6001 – 6500 Sq Ft</option>
                <option value="6501 – 7000 Sq Ft">6501 – 7000 Sq Ft</option>
                <option value="7001 – 7500 Sq Ft">7001 – 7500 Sq Ft</option>
                <option value="7501 – 8000 Sq Ft">7501 – 8000 Sq Ft</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="bedroom">Bedroom*</label>
              <select
                id="bedroom"
                name="bedroom"
                value={formData.bedroom}
                onChange={handleInputChange}
                required
              >
              
              <option value="1">One Bedroom</option>
              <option value="2">Two Bedroom</option>
              <option value="3">Three Bedroom</option>
              <option value="4">Four Bedroom</option>
              <option value="5">Five Bedroom</option>
              <option value="6">six Bedroom</option>
              </select>
            </div>
            <div className="form-group half">
              <label htmlFor="bathroom">Bathroom*</label>
              <select
                id="bathroom"
                name="bathroom"
                value={formData.bathroom}
                onChange={handleInputChange}
                required
              >
                <option value="1">One Bathroom</option>
                <option value="2">Two Bathroom</option>
                <option value="3">Three Bathroom</option>
                <option value="4">Four Bathroom</option>
                <option value="5">Five Bathroom</option>
                <option value="6">six Bathroom</option>
                <option value="7">No Bathroom</option>
              </select>
              </div>
            </div>
          
          {/* Add-ons section */}
          <h3 className="section-title">Additional Services</h3>
          
          <div className="form-row">
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="deluxe_cleaning"
                  checked={formData.deluxe_cleaning}
                  onChange={handleInputChange}
                />
                Deluxe Cleaning
              </label>
            </div>
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="heavy_duty"
                  checked={formData.heavy_duty}
                  onChange={handleInputChange}
                />
                Heavy Duty Cleaning
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="inside_fridge">Number of Refrigerators</label>
              <input
                type="number"
                id="inside_fridge"
                name="inside_fridge"
                value={formData.inside_fridge}
                onChange={handleNumberChange}
                min="0"
                maxLength={100}
              />
            </div>
            <div className="form-group half">
              <label htmlFor="inside_oven">Number of Ovens</label>
              <input
                type="number"
                id="inside_oven"
                name="inside_oven"
                value={formData.inside_oven}
                onChange={handleNumberChange}
                min="0"
                maxLength={100}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inside_cabinets"
                  checked={formData.inside_cabinets}
                  onChange={handleInputChange}
                />
                Inside Cabinets
              </label>
            </div>
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="load_dishwasher"
                  checked={formData.load_dishwasher}
                  onChange={handleInputChange}
                />
                Load Dishwasher
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="handwash_dishes"
                  checked={formData.handwash_dishes}
                  onChange={handleInputChange}
                />
                Handwash Dishes
              </label>
            </div>
            <div className="form-group half">
              <label htmlFor="laundry_folding">Laundry Loads</label>
              <input
                type="number"
                id="laundry_folding"
                name="laundry_folding"
                value={formData.laundry_folding}
                onChange={handleNumberChange}
                min="0"
                maxLength={100}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="eco_friendly"
                  checked={formData.eco_friendly}
                  onChange={handleInputChange}
                />
                Eco-Friendly Products
              </label>
            </div>
            <div className="form-group half">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="pet_hair_fee"
                  checked={formData.pet_hair_fee}
                  onChange={handleInputChange}
                />
                Pet Hair Fee
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="change_linen"
                  checked={formData.change_linen}
                  onChange={handleInputChange}
                />
                Change Linen & Make Beds
              </label>
            </div>
          </div>
          <div className="form-row"> 
            <div className="form-group half">
              <button type="button" className="price-button" onClick={getPrice}>
                Calculate Price
              </button>
            </div>
            <div className="form-group half">
              <button type="submit" className="submit-button" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </form>
                
        {price && (
          <div className="price-estimate">
            <h3>Estimated Price: ${price}</h3>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default PopupForm;