"use client"

import { useState, useEffect } from "react"
import { X, Check, Loader2, ArrowRight, DollarSign } from "lucide-react"
import "./PopupForm.css"

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
  })
  const [price, setPrice] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [quoteDate, setQuoteDate] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formTouched, setFormTouched] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Get the appropriate base URL from environment variables
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_API_BASE_URL_LOCAL || "http://localhost:8000"
      : process.env.REACT_APP_API_BASE_URL_DEPLOY 

  // Validation function for each step
  const validateStep = (step) => {
    const errors = {}
    
    if (step === 1) {
      // Step 1: Personal Information
      if (!formData.firstname.trim()) {
        errors.firstname = "First name is required"
      }
      if (!formData.lastname.trim()) {
        errors.lastname = "Last name is required"
      }
      if (!formData.email.trim()) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address"
      }
      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required"
      }
    } else if (step === 2) {
      // Step 2: Property Details
      if (!formData.frequency) {
        errors.frequency = "Frequency is required"
      }
      if (!formData.squarefeet) {
        errors.squarefeet = "Square footage is required"
      }
      if (!formData.bedroom) {
        errors.bedroom = "Number of bedrooms is required"
      }
      if (!formData.bathroom) {
        errors.bathroom = "Number of bathrooms is required"
      }
    }
    
    return errors
  }

  // Clear validation errors when form data changes
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({})
    }
  }, [formData])

  // Fetch price estimate whenever form data changes
  useEffect(() => {
    if (!formTouched) return

    // Create a debounce function to prevent too many API calls
    const debounce = setTimeout(() => {
      fetchPriceEstimate()
    }, 500) // Wait 500ms after last change before fetching

    return () => clearTimeout(debounce) // Cleanup timeout on component unmount or form data change
  }, [formData, formTouched])

  // Function to fetch price estimate
  const fetchPriceEstimate = async () => {
    // Only fetch price if we have the minimum required data
    if (!formData.frequency || !formData.squarefeet || !formData.bedroom || !formData.bathroom) {
      return
    }

    setIsPriceLoading(true)

    try {
      const response = await fetch(`${baseUrl}/api/price-estimate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setPrice(result.price)
      } else {
        console.error("Error getting price:", result)
        // Don't show error message for automatic price updates
      }
    } catch (error) {
      console.error("Error fetching price estimate:", error)
      // Don't show error message for automatic price updates
    } finally {
      setIsPriceLoading(false)
    }
  }

  // Handle form input change
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setFormTouched(true)
  }

  // Handle number input change
  const handleNumberChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number.parseInt(value, 10) || 0,
    }))
    setFormTouched(true)
  }

  // Submit form - now just handles the quote submission
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    // Prevent multiple submissions
    if (isSubmitting) return
  
    setIsSubmitting(true)
    setErrorMessage("")
  
    // Validate required fields
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.phone) {
      setErrorMessage("Please fill all required fields (*) before submitting")
      setIsSubmitting(false)
      return
    }
  
    try {
      // First, fetch the price estimate
      setIsPriceLoading(true)
      const priceResponse = await fetch(`${baseUrl}/api/price-estimate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
  
      const priceResult = await priceResponse.json()
      
      if (priceResponse.ok) {
        setPrice(priceResult.price)
        
        // After getting the price, send quote request
        const quoteResponse = await fetch(`${baseUrl}/api/quote-request/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
  
        // Process quote response
        const quoteResult = await quoteResponse.json()
        if (quoteResponse.ok) {
          setIsSubmitted(true)
          // Store the creation date if you need to display it
          if (quoteResult.date_created) {
            setQuoteDate(quoteResult.date_created)
          }
        } else {
          console.error("Error submitting quote:", quoteResult)
          setErrorMessage("Failed to submit your request. Please try again.")
        }
      } else {
        console.error("Error getting price:", priceResult)
        setErrorMessage("Failed to calculate price. Please try again.")
      }
    } catch (error) {
      console.error("Error processing request:", error)
      setErrorMessage("Connection error. Please check your internet and try again.")
    } finally {
      setIsSubmitting(false)
      setIsPriceLoading(false)
    }
  }

  // Handle close button click
  const handleClose = () => {
    setIsOpen(false)
  }

  // Navigate to next step with validation
  const goToNextStep = () => {
    const errors = validateStep(currentStep)
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setErrorMessage("Please fill in all required fields to continue")
      return
    }
    
    setValidationErrors({})
    setErrorMessage("")
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous step
  const goToPrevStep = () => {
    setValidationErrors({})
    setErrorMessage("")
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // If the popup is not open, return null to render nothing
  if (!isOpen) return null

  return (
    <div className="popup">
      <div className="popup-content">
        <button className="close-button" onClick={handleClose} aria-label="Close form">
          <X size={18} />
        </button>

        <h2 className="form-title">Let's get started!</h2>

        {/* Progress indicator */}
        <div className="progress-container">
          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <span className="step-label">Your Info</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <span className="step-label">Property</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <span className="step-label">Services</span>
            </div>
          </div>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div className="error-banner">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* Step 1: Personal Information */}
          <div className={`form-step ${currentStep === 1 ? "active" : ""}`}>
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="firstname">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstname"
                  placeholder="ex. Jane"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  maxLength={60}
                  required
                  className={validationErrors.firstname ? "error" : ""}
                />
                {validationErrors.firstname && (
                  <span className="error-text">{validationErrors.firstname}</span>
                )}
              </div>
              <div className="form-group half">
                <label htmlFor="lastname">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastname"
                  placeholder="ex. Smith"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  maxLength={60}
                  required
                  className={validationErrors.lastname ? "error" : ""}
                />
                {validationErrors.lastname && (
                  <span className="error-text">{validationErrors.lastname}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="ex. jane.smith@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  className={validationErrors.email ? "error" : ""}
                />
                {validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>
              <div className="form-group half">
                <label htmlFor="phone1">
                  Phone number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone1"
                  name="phone"
                  placeholder="ex. (555) 555-5555"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={16}
                  required
                  className={validationErrors.phone ? "error" : ""}
                />
                {validationErrors.phone && (
                  <span className="error-text">{validationErrors.phone}</span>
                )}
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" className="next-button" onClick={goToNextStep}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Step 2: Property Details */}
          <div className={`form-step ${currentStep === 2 ? "active" : ""}`}>
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="frequency">
                  Frequency <span className="required">*</span>
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                  className={validationErrors.frequency ? "error" : ""}
                >
                  <option value="weekly">Every 1 Week (discount 20%)</option>
                  <option value="biweekly">Every 2 Week (discount 15%)</option>
                  <option value="monthly">Every 4 Week (discount 10%)</option>
                  <option value="onetime">One Time (Deep)</option>
                </select>
                {validationErrors.frequency && (
                  <span className="error-text">{validationErrors.frequency}</span>
                )}
              </div>
              <div className="form-group half">
                <label htmlFor="squarefeet">
                  Square Feet <span className="required">*</span>
                </label>
                <select
                  id="squarefeet"
                  name="squarefeet"
                  value={formData.squarefeet}
                  onChange={handleInputChange}
                  required
                  className={validationErrors.squarefeet ? "error" : ""}
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
                {validationErrors.squarefeet && (
                  <span className="error-text">{validationErrors.squarefeet}</span>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="bedroom">
                  Bedroom <span className="required">*</span>
                </label>
                <select 
                  id="bedroom" 
                  name="bedroom" 
                  value={formData.bedroom} 
                  onChange={handleInputChange} 
                  required
                  className={validationErrors.bedroom ? "error" : ""}
                >
                  <option value="1">One Bedroom</option>
                  <option value="2">Two Bedroom</option>
                  <option value="3">Three Bedroom</option>
                  <option value="4">Four Bedroom</option>
                  <option value="5">Five Bedroom</option>
                  <option value="6">Six Bedroom</option>
                </select>
                {validationErrors.bedroom && (
                  <span className="error-text">{validationErrors.bedroom}</span>
                )}
              </div>
              <div className="form-group half">
                <label htmlFor="bathroom">
                  Bathroom <span className="required">*</span>
                </label>
                <select 
                  id="bathroom" 
                  name="bathroom" 
                  value={formData.bathroom} 
                  onChange={handleInputChange} 
                  required
                  className={validationErrors.bathroom ? "error" : ""}
                >
                  <option value="1">One Bathroom</option>
                  <option value="2">Two Bathroom</option>
                  <option value="3">Three Bathroom</option>
                  <option value="4">Four Bathroom</option>
                  <option value="5">Five Bathroom</option>
                  <option value="6">Six Bathroom</option>
                  <option value="7">No Bathroom</option>
                </select>
                {validationErrors.bathroom && (
                  <span className="error-text">{validationErrors.bathroom}</span>
                )}
              </div>
            </div>

            <div className="form-navigation">
              <button type="button" className="back-button" onClick={goToPrevStep}>
                Back
              </button>
              <button type="button" className="next-button" onClick={goToNextStep}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Step 3: Additional Services */}
          <div className={`form-step ${currentStep === 3 ? "active" : ""}`}>
            <h3 className="section-title">Additional Services</h3>

            <div className="form-row">
              <div className="form-group half">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="deluxe_cleaning"
                    checked={formData.deluxe_cleaning}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Deluxe Cleaning
                </label>
              </div>
              <div className="form-group half">
                <label className="checkbox-container">
                  <input type="checkbox" name="heavy_duty" checked={formData.heavy_duty} onChange={handleInputChange} />
                  <span className="checkmark"></span>
                  Heavy Duty Cleaning
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="inside_fridge">Number of Refrigerators</label>
                <div className="number-input">
                  <button
                    type="button"
                    className="number-decrement"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        inside_fridge: Math.max(0, prev.inside_fridge - 1),
                      }))
                    }
                    disabled={formData.inside_fridge <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="inside_fridge"
                    name="inside_fridge"
                    value={formData.inside_fridge}
                    onChange={handleNumberChange}
                    min="0"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    className="number-increment"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        inside_fridge: prev.inside_fridge + 1,
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="form-group half">
                <label htmlFor="inside_oven">Number of Ovens</label>
                <div className="number-input">
                  <button
                    type="button"
                    className="number-decrement"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        inside_oven: Math.max(0, prev.inside_oven - 1),
                      }))
                    }
                    disabled={formData.inside_oven <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="inside_oven"
                    name="inside_oven"
                    value={formData.inside_oven}
                    onChange={handleNumberChange}
                    min="0"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    className="number-increment"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        inside_oven: prev.inside_oven + 1,
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="inside_cabinets"
                    checked={formData.inside_cabinets}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Inside Cabinets
                </label>
              </div>
              <div className="form-group half">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="load_dishwasher"
                    checked={formData.load_dishwasher}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Load Dishwasher
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="handwash_dishes"
                    checked={formData.handwash_dishes}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Handwash Dishes
                </label>
              </div>
              <div className="form-group half">
                <label htmlFor="laundry_folding">Laundry Loads</label>
                <div className="number-input">
                  <button
                    type="button"
                    className="number-decrement"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        laundry_folding: Math.max(0, prev.laundry_folding - 1),
                      }))
                    }
                    disabled={formData.laundry_folding <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="laundry_folding"
                    name="laundry_folding"
                    value={formData.laundry_folding}
                    onChange={handleNumberChange}
                    min="0"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    className="number-increment"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        laundry_folding: prev.laundry_folding + 1,
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="eco_friendly"
                    checked={formData.eco_friendly}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Eco-Friendly Products
                </label>
              </div>
              <div className="form-group half">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="pet_hair_fee"
                    checked={formData.pet_hair_fee}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Pet Hair Fee
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="change_linen"
                    checked={formData.change_linen}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Change Linen & Make Beds
                </label>
              </div>
            </div>

            {/* Price estimate and submit section */}
            <div className="price-section">
              {isPriceLoading ? (
                <div className="price-loading">
                  <Loader2 className="spinner" size={24} />
                  <span>Calculating price...</span>
                </div>
              ) : isSubmitted && price ? (
                <div className="price-display">
                  <DollarSign size={24} />
                  <span className="price-amount">${price}</span>
                  <span className="price-label">Estimated Price</span>
                </div>
              ) : null}
            </div>

            <div className="form-navigation">
              <button type="button" className="back-button" onClick={goToPrevStep}>
                Back
              </button>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
                onClick={() => setIsSubmitted(true)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner" size={16} />
                    Processing...
                  </>
                ) : (
                  "Calculate Price"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PopupForm