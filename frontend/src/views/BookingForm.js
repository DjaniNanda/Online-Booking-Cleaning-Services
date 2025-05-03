"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  Home,
  CreditCard,
  Users,
  MapPin,
  Info,
  ChevronRight,
  Check,
  Sparkles,
  Zap,
  CloudSnowIcon as Snow,
  Flame,
  Box,
  Utensils,
  Droplet,
  Shirt,
  Leaf,
  PawPrintIcon as Paw,
  Bed,
} from "lucide-react"
import "./BookingForm.css"
const baseUrl = process.env.NODE_ENV === 'development' 
    ? (process.env.REACT_APP_API_BASE_URL_LOCAL || 'http://localhost:8000')
    : (process.env.REACT_APP_API_BASE_URL_DEPLOY || 'https://lovelyserenitybackend.onrender.com');
export default function BookingForm() {
  const [activeStep, setActiveStep] = useState(1)
  const [serviceType, setServiceType] = useState("HOME CLEANING: One Bedroom")
  const [bathrooms, setBathrooms] = useState("0")
  const [bedrooms, setBedrooms] = useState("1")
  const [squareFeet, setSquareFeet] = useState("0 - 500 Sq.Ft")
  const [frequency, setFrequency] = useState("Every 2 Weeks(Discount 15%)")
  const [selectedAddons, setSelectedAddons] = useState([])
  const [addonQuantities, setAddonQuantities] = useState({})
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    sendTextReminders: true,
  })
  const [address, setAddress] = useState({
    street: "",
    apt: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [dateTime, setDateTime] = useState(null)
  const [timeWindow, setTimeWindow] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState({
    condition: "",
    preferredTeam: "No preference",
    flexible: "Not flexible",
    referralSource: "",
  })
  const [access, setAccess] = useState({
    method: "Someone will be home",
    instructions: "",
  })
  const [parking, setParkingInfo] = useState({
    instructions: "",
    cost: "$0",
  })
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [tip, setTip] = useState("")
  const [payment, setPayment] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Booking summary state
  const [bookingSummary, setBookingSummary] = useState({
    serviceType: "HOME CLEANING: One Bedroom",
    serviceDate: "CHOOSE DATE",
    timeWindow: "TIME...",
    frequency: "Every 2 Weeks (Most Popular)",
    subTotal: 110,
    discount: 16.5,
    salesTax: 12.16,
    tip: 0,
    initialCleaning: 105.66,
  })

  // Available services and extras
  const serviceOptions = [
    "HOME CLEANING: One Bedroom",
    "HOME CLEANING: Two Bedroom",
    "HOME CLEANING: Three Bedroom",
    "HOME CLEANING: Four Bedroom",
    "HOME CLEANING: Five Bedroom",
  ]

  const frequencyOptions = [
    {
      id: 1,
      name: "Every 4 Weeks",
      discount: "10%",
      description: "Perfect for homes that only need occasional maintenance",
    },
    {
      id: 2,
      name: "Every 2 Weeks",
      discount: "15%",
      description: "Our most popular option for balanced cleanliness",
      popular: true,
    },
    { id: 3, name: "Every Week", discount: "20%", description: "Ideal for families or high-traffic homes" },
    { id: 4, name: "One Time", discount: "0%", description: "For a single deep clean with no commitment" },
  ]

  // Updated add-ons with icons
  const addonOptions = [
    {
      id: 1,
      name: "Deluxe Cleaning",
      icon: <Sparkles size={18} />,
      price: 49,
      variablePrice: true,
      description: "Deep cleaning including baseboards, fixtures, and extra kitchen/bath time",
    },
    {
      id: 2,
      name: "Heavy Duty",
      icon: <Zap size={18} />,
      price: 49,
      variablePrice: true,
      description: "For extremely soiled areas needing extra attention",
    },
    {
      id: 3,
      name: "Inside Fridge",
      icon: <Snow size={18} />,
      price: 35,
      variablePrice: true,
      quantity: 1,
      description: "Complete cleaning inside refrigerator",
    },
    {
      id: 4,
      name: "Inside Oven",
      icon: <Flame size={18} />,
      price: 35,
      variablePrice: true,
      quantity: 1,
      description: "Deep cleaning of your oven interior",
    },
    {
      id: 5,
      name: "Inside Cabinets",
      icon: <Box size={18} />,
      price: 49,
      variablePrice: false,
      description: "Kitchen and bathroom cabinet interiors",
    },
    {
      id: 6,
      name: "Load Dishwasher",
      icon: <Utensils size={18} />,
      price: 15,
      variablePrice: false,
      description: "We load your dirty dishes into the dishwasher",
    },
    {
      id: 7,
      name: "Handwash Dishes",
      icon: <Droplet size={18} />,
      price: 25,
      variablePrice: false,
      description: "Hand washing of your dishes",
    },
    {
      id: 8,
      name: "Laundry & Folding",
      icon: <Shirt size={18} />,
      price: 25,
      variablePrice: true,
      quantity: 1,
      description: "Per load, includes washing and folding",
    },
    {
      id: 9,
      name: "Eco-friendly Products",
      icon: <Leaf size={18} />,
      price: 20,
      variablePrice: false,
      description: "Only environmentally friendly cleaning products",
    },
    {
      id: 10,
      name: "Pet Hair Fee",
      icon: <Paw size={18} />,
      price: 20,
      variablePrice: false,
      description: "For homes with shedding pets requiring extra cleaning",
    },
    {
      id: 11,
      name: "Change Linens",
      icon: <Bed size={18} />,
      price: 10,
      variablePrice: true,
      description: "Change bed sheets and make beds",
    },
  ]

  // Initialize addon quantities on component mount
  useEffect(() => {
    const initialQuantities = {}
    addonOptions.forEach((addon) => {
      if (addon.variablePrice && [3, 4, 8].includes(addon.id)) {
        initialQuantities[addon.id] = 1
      }
    })
    setAddonQuantities(initialQuantities)
  }, [])

  // Handle add-ons selection
  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId))
    } else {
      setSelectedAddons([...selectedAddons, addonId])

      // Set default quantity if not already set
      if (!addonQuantities[addonId]) {
        const addon = addonOptions.find((a) => a.id === addonId)
        if (addon && addon.variablePrice && [3, 4, 8].includes(addon.id)) {
          setAddonQuantities((prev) => ({
            ...prev,
            [addonId]: 1,
          }))
        }
      }
    }
  }

  // Update quantity for add-ons that have variable quantities
  const updateAddonQuantity = (addonId, quantity, event) => {
    event.stopPropagation()
    setAddonQuantities((prev) => ({
      ...prev,
      [addonId]: quantity,
    }))
  }

  // Calculate price for add-ons based on formula and quantity
  const calculateAddonPrice = (addon) => {
    const bathroomCount = Number.parseInt(bathrooms) || 0
    const bedroomCount = Number.parseInt(bedrooms) || 0
    const quantity = addonQuantities[addon.id] || 1

    if (!addon.variablePrice) return addon.price

    switch (addon.id) {
      case 1: // Deluxe Cleaning
        return addon.price + 15 * (bathroomCount + bedroomCount)
      case 2: // Heavy Duty
        return addon.price + 5 * (bathroomCount + bedroomCount)
      case 3: // Inside Fridge
        return addon.price * quantity
      case 4: // Inside Oven
        return addon.price * quantity
      case 8: // Laundry & Folding
        return addon.price * quantity
      case 11: // Change linen
        return addon.price * bedroomCount
      default:
        return addon.price
    }
  }

  // Calculate base cleaning price
  const calculateBasePrice = () => {
    const basePrice = 99

    // Extract numeric value from square feet string
    let squareFeetValue = 0
    if (typeof squareFeet === "string") {
      // Parse something like "0 - 500 Sq.Ft" to get the upper bound (500)
      const match = squareFeet.match(/(\d+)\s*-\s*(\d+)/)
      if (match && match[2]) {
        squareFeetValue = Number.parseInt(match[2])
      } else {
        squareFeetValue = Number.parseInt(squareFeet) || 0
      }
    }

    const squareFeetMultiplier = Math.ceil(squareFeetValue / 500) || 1
    const roomsPrice = 25 * (Number.parseInt(bathrooms) + Number.parseInt(bedrooms))

    return basePrice + 30 * squareFeetMultiplier + roomsPrice
  }

  useEffect(() => {
    const match = serviceType.match(/One|Two|Three|Four|Five/)
    const map = {
      One: "1",
      Two: "2",
      Three: "3",
      Four: "4",
      Five: "5",
    }
    if (match) {
      setBedrooms(map[match[0]])
    }
  }, [serviceType])

  // Update booking summary when selections change
  useEffect(() => {
    // Calculate base price
    const basePrice = calculateBasePrice()

    // Calculate add-ons cost
    const addonsTotal = selectedAddons.reduce((total, id) => {
      const addon = addonOptions.find((opt) => opt.id === id)
      return total + (addon ? calculateAddonPrice(addon) : 0)
    }, 0)

    // Calculate discount based on frequency
    let discountRate = 0
    switch (frequency) {
      case "Every Week(Discount 20%)":
        discountRate = 0.2
        break
      case "Every 2 Weeks(Discount 15%)":
        discountRate = 0.15
        break
      case "Every 4 Weeks(Discount 10%)":
        discountRate = 0.1
        break
      default:
        discountRate = 0
    }

    const discount = basePrice * discountRate

    // Calculate subtotal
    const subTotal = basePrice + addonsTotal
    // Parse tip value
    const tipAmount = Number.parseFloat(tip) || 0
    // Calculate tax (assuming 13% tax rate)
    const taxRate = 0.13
    const salesTax = (subTotal - discount + tipAmount) * taxRate

    // Calculate total
    const initialCleaning = subTotal - discount + tipAmount + salesTax

    setBookingSummary({
      ...bookingSummary,
      serviceType,
      serviceDate: dateTime ? dateTime.toLocaleDateString() : "Choose service date...",
      timeWindow: timeWindow || "Select time...",
      frequency,
      subTotal: subTotal.toFixed(2),
      discount: discount.toFixed(2),
      salesTax: salesTax.toFixed(2),
      tip: tipAmount.toFixed(2),
      initialCleaning: initialCleaning.toFixed(2),
    })
  }, [
    serviceType,
    frequency,
    selectedAddons,
    dateTime,
    timeWindow,
    bathrooms,
    bedrooms,
    squareFeet,
    tip,
    addonQuantities,
  ])

  // Steps for the booking form
  const steps = [
    { id: 1, name: "Services", icon: <Home size={20} color="#4ade80" /> },
    { id: 2, name: "Schedule", icon: <Calendar size={20} color="#4ade80" /> },
    { id: 3, name: "Details", icon: <Users size={20} color="#4ade80" /> },
    { id: 4, name: "Payment", icon: <CreditCard size={20} color="#4ade80" /> },
  ]

  // Mock date picker for demonstration
  const DatePickerComponent = ({ selectedDate, onChange }) => {
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const dateOptions = [
      { date: today, formatted: today.toLocaleDateString() },
      { date: nextWeek, formatted: nextWeek.toLocaleDateString() },
    ]

    return (
      <div className="date-picker">
        <label>Select Date</label>
        <div className="date-options">
          {dateOptions.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(option.date)}
              className={`date-option ${selectedDate && selectedDate.toDateString() === option.date.toDateString() ? "selected" : ""}`}
            >
              {option.formatted}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Submit form handler
  const handleSubmit = (e) => {
    e.preventDefault()

    // Create the data object to send to Django backend
    const formData = {
      service: {
        type: serviceType,
        bathrooms: Number.parseInt(bathrooms),
        bedrooms: Number.parseInt(bedrooms),
        squareFeet: squareFeet,
        frequency: frequency,
        addons: selectedAddons.map((id) => {
          const addon = addonOptions.find((a) => a.id === id)
          return {
            id: id,
            name: addon.name,
            price: calculateAddonPrice(addon),
            quantity: addonQuantities[id] || 1,
          }
        }),
      },
      schedule: {
        date: dateTime ? dateTime.toISOString().split("T")[0] : null,
        timeWindow: timeWindow,
        flexible: additionalInfo.flexible,
        access: access,
      },
      customer: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        mobile: personalInfo.mobile,
        sendTextReminders: personalInfo.sendTextReminders,
      },
      address: address,
      parking: parking,
      additionalInfo: {
        condition: additionalInfo.condition,
        specialInstructions: specialInstructions,
        referralSource: additionalInfo.referralSource,
      },
      payment: {
        tip: Number.parseFloat(tip) || 0,
        subtotal: Number.parseFloat(bookingSummary.subTotal),
        discount: Number.parseFloat(bookingSummary.discount),
        tax: Number.parseFloat(bookingSummary.salesTax),
        total: Number.parseFloat(bookingSummary.initialCleaning),
      },
    }

    // Send data to Django backend
    fetch(`${baseUrl}/api/booking/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        alert("Booking submitted successfully! You will receive a confirmation email shortly.")
      })
      .catch((error) => {
        console.error("Error submitting form:", error)
        alert("There was an error submitting your booking. Please try again.")
      })
  }

  // Next step handler
  const nextStep = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1)
      window.scrollTo(0, 0)
    }
  }

  // Previous step handler
  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="booking-form-container">
      <div className="container">
        <div className="header">
          <h1>Schedule Your Perfect Cleaning Service</h1>
          <p>Tell us about your needs and we'll match you with the right team</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className="steps-container">
            {steps.map((step) => (
              <div key={step.id} className="step">
                <div className={`step-icon ${activeStep >= step.id ? "active" : ""}`}>{step.icon}</div>
                <div className="step-name">
                  <span className={activeStep >= step.id ? "active" : ""}>{step.name}</span>
                </div>
                {step.id < steps.length && <div className={`step-line ${activeStep > step.id ? "active" : ""}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Form Content */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Services */}
              {activeStep === 1 && (
                <div className="step-content">
                  {/* Service Type */}
                  <div className="section">
                    <h2 className="section-title">
                      <Home size={20} className="icon" color="#4ade80" />
                      Choose Your Service
                    </h2>

                    <div className="service-options">
                      {serviceOptions.map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => setServiceType(option)}
                          className={`service-option ${serviceType === option ? "selected" : ""}`}
                        >
                          <div className="service-option-content">
                            <span className="service-name">{option}</span>
                            {serviceType === option && <Check size={20} className="check-icon" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms and Square Feet */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Bathrooms</label>
                      <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="form-select">
                        {[0, 1, 2, 3, 4].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Bathroom" : "Bathrooms"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Square Feet</label>
                      <select
                        value={squareFeet}
                        onChange={(e) => setSquareFeet(e.target.value)}
                        className="form-select"
                      >
                        <option value="0 - 500 Sq.Ft">0 - 500 Sq.Ft</option>
                        <option value="501 - 1000 Sq.Ft">501 - 1000 Sq.Ft</option>
                        <option value="1001 - 1500 Sq.Ft">1001 - 1500 Sq.Ft</option>
                        <option value="1501 - 2000 Sq.Ft">1501 - 2000 Sq.Ft</option>
                        <option value="2001+ Sq.Ft">2001+ Sq.Ft</option>
                      </select>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="section">
                    <h3 className="subsection-title">How Often?</h3>
                    <p className="subsection-description">Choose a frequency that suits your lifestyle</p>

                    <div className="frequency-options">
                      {frequencyOptions.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => setFrequency(`${option.name}(Discount ${option.discount})`)}
                          className={`frequency-option ${frequency === `${option.name}(Discount ${option.discount})` ? "selected" : ""}`}
                        >
                          {option.popular && <span className="popular-badge">Popular</span>}
                          <div className="frequency-content">
                            <span className="frequency-name">{option.name}</span>
                            <span className="frequency-discount">{option.discount} discount</span>
                            <span className="frequency-description">{option.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="section">
                    <h3 className="subsection-title">Customize Your Cleaning</h3>
                    <p className="subsection-description">
                      <span className="highlight">Recommended:</span> A Deluxe Cleaning for first-time visits provides a
                      thorough baseline for ongoing maintenance
                    </p>

                    <div className="addon-options">
                      {addonOptions.map((addon) => (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`addon-option ${selectedAddons.includes(addon.id) ? "selected" : ""}`}
                        >
                          <div className="addon-content">
                            <div className="addon-header">
                              <div className="addon-title">
                                <span className="addon-icon">{addon.icon}</span>
                                <span className="addon-name">{addon.name}</span>
                                {addon.id === 1 && <span className="recommended-badge">Recommended</span>}
                              </div>
                              <div className="addon-description">{addon.description}</div>
                              <div className="addon-price">
                                ${calculateAddonPrice(addon).toFixed(2)}
                                {addon.variablePrice &&
                                  (addon.id === 11
                                    ? " per bedroom"
                                    : addon.id === 3
                                      ? " per fridge"
                                      : addon.id === 4
                                        ? " per oven"
                                        : addon.id === 8
                                          ? " per load"
                                          : "")}
                              </div>

                              {selectedAddons.includes(addon.id) &&
                                addon.variablePrice &&
                                [3, 4, 8].includes(addon.id) && (
                                  <div className="quantity-selector" onClick={(e) => e.stopPropagation()}>
                                    <span className="quantity-label">Quantity:</span>
                                    <div className="quantity-controls">
                                      <button
                                        type="button"
                                        onClick={(e) =>
                                          updateAddonQuantity(
                                            addon.id,
                                            Math.max(1, (addonQuantities[addon.id] || 1) - 1),
                                            e,
                                          )
                                        }
                                        className="quantity-btn"
                                      >
                                        -
                                      </button>
                                      <span className="quantity-value">{addonQuantities[addon.id] || 1}</span>
                                      <button
                                        type="button"
                                        onClick={(e) =>
                                          updateAddonQuantity(addon.id, (addonQuantities[addon.id] || 1) + 1, e)
                                        }
                                        className="quantity-btn"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </div>
                            {selectedAddons.includes(addon.id) && (
                              <div className="addon-check">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={nextStep} className="btn btn-primary">
                      Continue to Scheduling
                      <ChevronRight size={20} className="btn-icon" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule */}
              {activeStep === 2 && (
                <div className="step-content">
                  <h2 className="section-title">
                    <Calendar size={20} className="icon" color="#4ade80" />
                    Select Your Preferred Date & Time
                  </h2>

                  <div className="info-box">
                    <div className="info-content">
                      <Info size={20} className="info-icon" color="#4ade80" />
                      <p className="info-text">
                        The time window represents when our cleaning team will arrive, not the duration of cleaning. For
                        next-day service, please book before 7 PM.
                      </p>
                    </div>
                  </div>

                  <div className="form-row">
                    {/* Date Picker */}
                    <div className="form-group">
                      <DatePickerComponent selectedDate={dateTime} onChange={(date) => setDateTime(date)} />
                    </div>

                    {/* Time Window */}
                    <div className="form-group">
                      <label>Time Window</label>
                      <div className="time-options">
                        {["8am - 10am", "10am - 12pm", "12pm - 2pm", "2pm - 4pm", "4pm - 6pm"].map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setTimeWindow(time)}
                            className={`time-option ${timeWindow === time ? "selected" : ""}`}
                          >
                            <div className="time-option-content">
                              <Clock size={16} className="time-icon" />
                              {time}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional scheduling preferences */}
                  <div className="section">
                    <h3 className="subsection-title">Scheduling Preferences</h3>

                    <div className="form-group">
                      <label>How flexible are you with arrival time?</label>
                      <select
                        value={additionalInfo.flexible}
                        onChange={(e) => setAdditionalInfo({ ...additionalInfo, flexible: e.target.value })}
                        className="form-select"
                      >
                        <option value="Not flexible">Not flexible</option>
                        <option value="Flexible within 1 hour">Flexible within 1 hour</option>
                        <option value="Flexible within 2 hours">Flexible within 2 hours</option>
                        <option value="Very flexible">Very flexible</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>How will we access your home?</label>
                      <select
                        value={access.method}
                        onChange={(e) => setAccess({ ...access, method: e.target.value })}
                        className="form-select"
                      >
                        <option value="Someone will be home">Someone will be home</option>
                        <option value="Doorman">Doorman</option>
                        <option value="Key in lockbox">Key in lockbox</option>
                        <option value="Smart lock">Smart lock</option>
                      </select>
                    </div>

                    {access.method !== "Someone will be home" && (
                      <div className="form-group">
                        <label>Access Instructions</label>
                        <textarea
                          value={access.instructions}
                          onChange={(e) => setAccess({ ...access, instructions: e.target.value })}
                          rows={3}
                          className="form-textarea"
                          placeholder="Provide any specific access instructions here"
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={prevStep} className="btn btn-secondary">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="btn btn-primary">
                      Continue to Details
                      <ChevronRight size={20} className="btn-icon" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {activeStep === 3 && (
                <div className="step-content">
                  <h2 className="section-title">
                    <Users size={20} className="icon" color="#4ade80" />
                    Your Information
                  </h2>

                  {/* Personal Information */}
                  <div className="section">
                    <h3 className="subsection-title">Contact Details</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={personalInfo.firstName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={personalInfo.lastName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Mobile Phone</label>
                        <input
                          type="tel"
                          value={personalInfo.mobile}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, mobile: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="sendTextReminders"
                        checked={personalInfo.sendTextReminders}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, sendTextReminders: e.target.checked })}
                        className="checkbox"
                      />
                      <label htmlFor="sendTextReminders" className="checkbox-label">
                        Send me text message reminders about my cleaning service
                      </label>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="section">
                    <h3 className="subsection-title">
                      <MapPin size={18} className="icon" color="#4ade80" />
                      Service Address
                    </h3>

                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Apartment/Suite/Unit (optional)</label>
                      <input
                        type="text"
                        value={address.apt}
                        onChange={(e) => setAddress({ ...address, apt: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-row three-columns">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Province/Teritory</label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="form-select"
                          required
                        >
                          <option value="">Select Province</option>
                          <option value="Alberta">Alberta</option>
                          <option value="British Columbia">British Columbia</option>
                          <option value="Manitoba">Manitoba</option>
                          <option value="New Brunswick">New Brunswick</option>
                          <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                          <option value="Nova Scotia">Nova Scotia</option>
                          <option value="Ontario">Ontario</option>
                          <option value="Prince Edward Island">Prince Edward Island</option>
                          <option value="Quebec">Quebec</option>
                          <option value="Saskatchewan">Saskatchewan</option>
                          <option value="Northwest Territories">Northwest Territories</option>
                          <option value="Nunavut">Nunavut</option>
                          <option value="Yukon">Yukon</option>
                          {/* Add more states as needed */}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Zip Code</label>
                        <input
                          type="text"
                          value={address.zipCode}
                          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parking Information */}
                  <div className="section">
                    <h3 className="subsection-title">Parking Information</h3>

                    <div className="form-group">
                      <label>Parking Instructions</label>
                      <textarea
                        value={parking.instructions}
                        onChange={(e) => setParkingInfo({ ...parking, instructions: e.target.value })}
                        rows={3}
                        className="form-textarea"
                        placeholder="Where should our cleaning team park? Is there a parking fee or permit required?"
                      />
                    </div>

                    <div className="form-group">
                      <label>Parking Cost (if any)</label>
                      <select
                        value={parking.cost}
                        onChange={(e) => setParkingInfo({ ...parking, cost: e.target.value })}
                        className="form-select"
                      >
                        <option value="$0">$0 (Free parking available)</option>
                        <option value="$5">$5</option>
                        <option value="$10">$10</option>
                        <option value="$15">$15</option>
                        <option value="$20+">$20+</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="section">
                    <h3 className="subsection-title">Additional Information</h3>

                    <div className="form-group">
                      <label>Home Condition</label>
                      <select
                        value={additionalInfo.condition}
                        onChange={(e) => setAdditionalInfo({ ...additionalInfo, condition: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Select condition</option>
                        <option value="Excellent">Excellent - Just needs maintaining</option>
                        <option value="Good">Good - Regular cleaning needed</option>
                        <option value="Fair">Fair - Some problem areas</option>
                        <option value="Poor">Poor - Needs deep cleaning</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Special Instructions or Requests</label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        rows={4}
                        className="form-textarea"
                        placeholder="Any preferences, areas to focus on, or things to avoid?"
                      />
                    </div>

                    <div className="form-group">
                      <label>How did you hear about us?</label>
                      <select
                        value={additionalInfo.referralSource}
                        onChange={(e) => setAdditionalInfo({ ...additionalInfo, referralSource: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Select an option</option>
                        <option value="Google Search">Google Search</option>
                        <option value="Friend or Family">Friend or Family</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Email">Email</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={prevStep} className="btn btn-secondary">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="btn btn-primary">
                      Continue to Payment
                      <ChevronRight size={20} className="btn-icon" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {activeStep === 4 && (
                <div className="step-content">
                  <h2 className="section-title">
                    <CreditCard size={20} className="icon" color="#4ade80" />
                    Payment Information
                  </h2>

                  {/* Tip section */}
                  <div className="section">
                    <h3 className="subsection-title">Add a Tip</h3>
                    <p className="subsection-description">Show appreciation for your cleaning team's hard work</p>

                    <div className="tip-options">
                      {["0", "15", "20", "25", "Other"].map((tipOption) => (
                        <button
                          key={tipOption}
                          type="button"
                          onClick={() => (tipOption === "Other" ? null : setTip(tipOption))}
                          className={`tip-option ${tip === tipOption ? "selected" : ""}`}
                        >
                          {tipOption === "Other" ? "Other" : `$${tipOption}`}
                        </button>
                      ))}
                    </div>

                    {tip === "Other" && (
                      <div className="form-group">
                        <label>Custom Amount</label>
                        <div className="currency-input">
                          <span className="currency-symbol">$</span>
                          <input
                            type="number"
                            value={tip}
                            onChange={(e) => setTip(e.target.value)}
                            className="form-input"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Form */}
                  <div className="section">
                    <h3 className="subsection-title">Credit Card Information</h3>

                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiration Date</label>
                        <input
                          type="text"
                          value={payment.expiryDate}
                          onChange={(e) => setPayment({ ...payment, expiryDate: e.target.value })}
                          className="form-input"
                          placeholder="MM/YY"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                          className="form-input"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    <div className="terms-section">
                      <div className="checkbox-group">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="checkbox"
                          required
                        />
                        <label htmlFor="terms" className="checkbox-label">
                          I accept the{" "}
                          <a href="#" className="link">
                            Terms and Conditions
                          </a>{" "}
                          and{" "}
                          <a href="#" className="link">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={prevStep} className="btn btn-secondary">
                      Back
                    </button>
                    <button type="submit" className="btn btn-success">
                      Complete Booking
                      <Check size={20} className="btn-icon" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Booking Summary */}
          <div className="summary-container">
            <div className="summary-card">
              <h3 className="summary-title">Booking Summary</h3>

              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-label">Service:</span>
                  <span className="summary-value">{bookingSummary.serviceType}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">{bookingSummary.serviceDate}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Time:</span>
                  <span className="summary-value">{bookingSummary.timeWindow}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Frequency:</span>
                  <span className="summary-value">{bookingSummary.frequency.split("(")[0]}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">${bookingSummary.subTotal}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Discount:</span>
                  <span className="summary-value discount">-${bookingSummary.discount}</span>
                </div>

                {Number.parseInt(bookingSummary.tip) > 0 && (
                  <div className="summary-row">
                    <span className="summary-label">Tip:</span>
                    <span className="summary-value">${bookingSummary.tip}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span className="summary-label">Tax:</span>
                  <span className="summary-value">${bookingSummary.salesTax}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span className="summary-label">Total:</span>
                  <span className="summary-value">${bookingSummary.initialCleaning}</span>
                </div>
                <p className="summary-note">You won't be charged until after your service is completed</p>
              </div>

              <div className="summary-footer">
                <div className="guarantee-box">
                  <div className="guarantee-content">
                    <Info size={18} className="guarantee-icon" color="#4ade80" />
                    <div>
                      <h4 className="guarantee-title">100% Satisfaction Guarantee</h4>
                      <p className="guarantee-text">
                        If you're not completely satisfied, we'll come back and make it right at no additional cost.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
