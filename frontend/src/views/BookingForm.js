import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './BookingForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroom, faSprayCan, faSnowflake, faUtensils, faSink, faLeaf, faPaw, faBed, faTshirt, faFire } from '@fortawesome/free-solid-svg-icons';

const BookingForm = () => {
  
  const [serviceType, setServiceType] = useState('HOME CLEANING: One Bedroom/Studio');
  const [bathrooms, setBathrooms] = useState('0');
  const [bedrooms, setBedrooms] = useState('1');
  const [squareFeet, setSquareFeet] = useState('0 - 500 Sq.Ft');
  const [frequency, setFrequency] = useState('Every 2 Weeks(Discount 15%)');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const baseUrl = process.env.NODE_ENV === 'development' 
  ? (process.env.REACT_APP_API_BASE_URL_LOCAL || 'http://localhost:8000')
  : (process.env.REACT_APP_API_BASE_URL_DEPLOY || 'https://lovelyserenitybackend.onrender.com/');
  // New state to track addon quantities
  const [addonQuantities, setAddonQuantities] = useState({});
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    sendTextReminders: true
  });
  const [address, setAddress] = useState({
    street: '',
    apt: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [dateTime, setDateTime] = useState(null);
  const [timeWindow, setTimeWindow] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState({
    condition: '',
    preferredTeam: 'No preference',
    flexible: 'Not flexible',
    referralSource: ''
  });
  const [access, setAccess] = useState({
    method: 'Someone will be home',
    instructions: ''
  });
  const [parking, setParkingInfo] = useState({
    instructions: '',
    cost: '$0'
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tip, setTip] = useState('');
  const [payment, setPayment] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Booking summary state
  const [bookingSummary, setBookingSummary] = useState({
    serviceType: 'HOME CLEANING: One Bedroom',
    serviceDate: 'CHOOSE DATE',
    timeWindow: 'TIME...',
    frequency: 'Every 2 Weeks (Most Popular)',
    subTotal: 110,
    discount: 16.50,
    salesTax: 12.16,
    tip: 0,
    initialCleaning: 105.66
  });

  // Available services and extras
  const serviceOptions = [
    'HOME CLEANING: One Bedroom',
    'HOME CLEANING: Two Bedroom',
    'HOME CLEANING: Three Bedroom',
    'HOME CLEANING: Four Bedroom',
    'HOME CLEANING: Five Bedroom'
  ];
  
  const frequencyOptions = [
    'Every 4 Weeks(Discount 20%)',
    'Every 2 Weeks(Discount 15%)',
    'Every Week(Discount 10%)',
    'One Time'
  ];
  
  // Updated add-ons with icons and new pricing structure
  const addonOptions = [
    { id: 1, name: 'Deluxe Cleaning', icon: faBroom, price: 49, variablePrice: true, formula: 'base + 15 * (#bathrooms + #bedrooms)' },
    { id: 2, name: 'Heavy Duty', icon: faSprayCan, price: 49, variablePrice: true, formula: 'base + 5 * (#bathrooms + #bedrooms)' },
    { id: 3, name: 'Inside Fridge', icon: faSnowflake, price: 35, variablePrice: true, formula: 'price * #fridges', quantity: 1 },
    { id: 4, name: 'Inside Oven', icon: faFire, price: 35, variablePrice: true, formula: 'price * #ovens', quantity: 1 },
    { id: 5, name: 'Inside Cabinets (Kitchen and Washroom)', icon: faSink, price: 49, variablePrice: false },
    { id: 6, name: 'Load Dishwasher', icon: faUtensils, price: 15, variablePrice: false },
    { id: 7, name: 'Handwash Dishes', icon: faSink, price: 25, variablePrice: false },
    { id: 8, name: 'Laundry & Folding - Per Load', icon: faTshirt, price: 25, variablePrice: true, formula: 'price * #loads', quantity: 1 },
    { id: 9, name: 'Use only eco-friendly / green cleaning products', icon: faLeaf, price: 20, variablePrice: false },
    { id: 10, name: 'Pet Hair Fee', icon: faPaw, price: 20, variablePrice: false },
    { id: 11, name: 'Change linen; make beds', icon: faBed, price: 10, variablePrice: true, formula: 'price * #bedrooms' }
  ];
  
  // Initialize addon quantities on component mount
  useEffect(() => {
    const initialQuantities = {};
    addonOptions.forEach(addon => {
      if (addon.variablePrice && (addon.id === 3 || addon.id === 4 || addon.id === 8)) {
        initialQuantities[addon.id] = 1;
      }
    });
    setAddonQuantities(initialQuantities);
  }, []);
  
  // Handle add-ons selection
  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
      
      // Set default quantity if not already set
      if (!addonQuantities[addonId]) {
        const addon = addonOptions.find(a => a.id === addonId);
        if (addon && addon.variablePrice && (addon.id === 3 || addon.id === 4 || addon.id === 8)) {
          setAddonQuantities(prev => ({
            ...prev,
            [addonId]: 1
          }));
        }
      }
    }
  };
  
  // Update quantity for add-ons that have variable quantities
  const updateAddonQuantity = (addonId, quantity) => {
    setAddonQuantities(prev => ({
      ...prev,
      [addonId]: quantity
    }));
  };
  
  // Calculate price for add-ons based on formula and quantity
  const calculateAddonPrice = (addon) => {
    const bathroomCount = parseInt(bathrooms) || 0;
    const bedroomCount = parseInt(bedrooms) || 0;
    const quantity = addonQuantities[addon.id] || 1;
    
    if (!addon.variablePrice) return addon.price;
    
    switch (addon.id) {
      case 1: // Deluxe Cleaning
        return addon.price + (15 * (bathroomCount + bedroomCount));
      case 2: // Heavy Duty
        return addon.price + (5 * (bathroomCount + bedroomCount));
      case 3: // Inside Fridge
        return addon.price * quantity;
      case 4: // Inside Oven
        return addon.price * quantity;
      case 8: // Laundry & Folding
        return addon.price * quantity;
      case 11: // Change linen
        return addon.price * bedroomCount;
      default:
        return addon.price;
    }
  };
  
  // Calculate base cleaning price
  const calculateBasePrice = () => {
    const basePrice = 99;
    
    // Extract numeric value from square feet string
    let squareFeetValue = 0;
    if (typeof squareFeet === 'string') {
      // Parse something like "0 - 500 Sq.Ft" to get the upper bound (500)
      const match = squareFeet.match(/(\d+)\s*-\s*(\d+)/);
      if (match && match[2]) {
        squareFeetValue = parseInt(match[2]);
      } else {
        squareFeetValue = parseInt(squareFeet) || 0;
      }
    }
    
    const squareFeetMultiplier = Math.ceil(squareFeetValue / 500) || 1;
    const roomsPrice = 25 * (parseInt(bathrooms) + parseInt(bedrooms));
    
    return basePrice + (30 * squareFeetMultiplier) + roomsPrice;
  };
  
  useEffect(() => {
    const match = serviceType.match(/One|Two|Three|Four|Five/);
    const map = {
      'One': '1',
      'Two': '2',
      'Three': '3',
      'Four': '4',
      'Five': '5'
    };
    if (match) {
      setBedrooms(map[match[0]]);
    }
  }, [serviceType]);
  
  // Update booking summary when selections change
  useEffect(() => {
    // Calculate base price
    const basePrice = calculateBasePrice();
    
    // Calculate add-ons cost
    const addonsTotal = selectedAddons.reduce((total, id) => {
      const addon = addonOptions.find(opt => opt.id === id);
      return total + (addon ? calculateAddonPrice(addon) : 0);
    }, 0);
    
    // Calculate discount based on frequency - exact string matching
    let discountRate = 0;
    switch (frequency) {
      case 'Every Week(Discount 10%)':
        discountRate = 0.10; // 10% discount
        break;
      case 'Every 2 Weeks(Discount 15%)':
        discountRate = 0.15; // 15% discount
        break;
      case 'Every 4 Weeks(Discount 20%)':
        discountRate = 0.20; // 20% discount
        break;
      default:
        discountRate = 0; // No discount for one-time service
    }
    
    const discount = basePrice * discountRate;
    
    // Calculate subtotal
    const subTotal = basePrice + addonsTotal;
    // Parse tip value - convert to number or default to 0 if not a valid number
    const tipAmount = parseFloat(tip) || 0;
    // Calculate tax (assuming 13% tax rate)
    const taxRate = 0.13;
    const salesTax = (subTotal - discount + tipAmount) * taxRate;
    
    // Calculate total (subtract discount from subtotal, then add tax)
    const initialCleaning = subTotal - discount + tipAmount + salesTax;
    
    setBookingSummary({
      ...bookingSummary,
      serviceType,
      serviceDate: dateTime ? dateTime.toLocaleDateString() : 'Choose service date...',
      timeWindow: timeWindow || 'Select time...',
      frequency,
      subTotal: subTotal.toFixed(2),
      discount: discount.toFixed(2),
      salesTax: salesTax.toFixed(2),
      tip: tipAmount.toFixed(2),
      initialCleaning: initialCleaning.toFixed(2)
    });
  }, [serviceType, frequency, selectedAddons, dateTime, timeWindow, bathrooms, bedrooms, squareFeet, tip, addonQuantities]);
  
  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Prepare add-ons with quantities for backend
      const addonsWithQuantities = selectedAddons.map(addonId => {
        const addon = addonOptions.find(opt => opt.id === addonId);
        const quantity = addonQuantities[addonId] || 1;
        const calculatedPrice = calculateAddonPrice(addon);
        
        return {
          id: addonId,    
          quantity: quantity,
        };
      });
  
      // Prepare data for backend
      const formData = {
        serviceType,
        bathrooms,
        bedrooms,
        squareFeet,
        frequency,
        selectedAddons: addonsWithQuantities, // Now includes quantities and calculated prices
        personalInfo,
        address,
        dateTime: dateTime ? dateTime.toISOString() : null,
        timeWindow,
        additionalInfo,
        access,
        parking,
        specialInstructions,
        tip,
        payment: {
          ...payment,
          cardNumber: payment.cardNumber.replace(/\D/g, '').slice(-4) // Send only last 4 digits for security
        }
      };
  
      // Send to backend
      const response = await fetch(`${baseUrl}/api/booking/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      // Check if request was successful
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from server:', errorData);
        alert('There was an error processing your booking. Please try again.');
        return;
      }
  
      // Parse the JSON response
      const responseData = await response.json();
  
      // Handle successful response
      if (responseData.success) {
        alert('Booking successful! You will receive a confirmation email shortly.');
        // Reset form or redirect to confirmation page
      } else {
        alert('Booking failed. Please check your input.');
      }
  
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was a network error. Please try again.');
    }
  };
  
  return (
    <Container className="booking-container">
      <h1 className="text-center my-4">Complete Your Booking & Schedule A Cleaning Service</h1>
      <div className="alert alert-info">
        A Hold Will Be Placed On Your Card 24 Hours Prior To Your Cleaning And Charged After The Cleaning Is Complete
      </div>
      
      <Row>
        <Col md={8} >
          <Form onSubmit={handleSubmit}>
            {/* Service Selection Section */}
            <section className="form-section">
              <h3>CHOOSE SERVICES (SELECT ALL THAT APPLY)</h3>
              <Form.Group>
                <Form.Label>Service Type</Form.Label>
                <Form.Control 
                  as="select"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  {serviceOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Bathrooms</Form.Label>
                    <Form.Control 
                      as="select"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                    >
                      <option value="0">0 Bathrooms</option>
                      <option value="1">1 Bathroom</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="3">3 Bathrooms</option>
                      <option value="4">4 Bathrooms</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Square Feet</Form.Label>
                    <Form.Control 
                      as="select"
                      value={squareFeet}
                      onChange={(e) => setSquareFeet(e.target.value)}
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
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </section>
            
            {/* Frequency Section */}
            <section className="form-section">
              <h3>HOW OFTEN?</h3>
              <p>Standard pricing is for recurring services. One-time service is +24 hours notice.</p>
              <p>Frequency discounts begin on your first appointment: 5% Off for Every 4 Weeks, 10% off for Every 2 Weeks, 20% Off for Every Week</p>
              
              <div className="frequency-options">
                {frequencyOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`frequency-option ${frequency === option ? 'selected' : ''}`}
                    onClick={() => setFrequency(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </section>
            
            {/* Add-ons Section */}
            <section className="form-section">
              <h3>SELECT ADD-ONS</h3>
              <p>We ALWAYS recommend a Deluxe Cleaning for the first visit in order to establish a baseline for ongoing maintenance. Deluxe Cleaning adds extra time and additional checklist items, including polishing exterior cabinets, hand-washing baseboards, light fixtures, doors & doorframes, and extra time for the kitchen/bath.</p>
              
              <Row className="addons-grid">
                {addonOptions.map((addon) => (
                  <Col key={addon.id} xs={12} md={6} className="mb-3">
                    <div 
                      className={`addon-option ${selectedAddons.includes(addon.id) ? 'selected' : ''}`}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <div className="addon-icon">
                        <FontAwesomeIcon icon={addon.icon} size="2x" />
                      </div>
                      <div className="addon-details">
                        <div className="addon-name">{addon.name}</div>
                        <div className="addon-price">
                          ${addon.variablePrice ? 
                            `${addon.price}${addon.formula.includes('#bathrooms') ? ` + ${addon.formula.split('base + ')[1]}` : 
                            addon.formula.includes('* #') ? ` per ${addon.formula.split('* #')[1]}` : ''}` : 
                            addon.price}
                        </div>
                        {selectedAddons.includes(addon.id) && addon.variablePrice && 
                         ['Inside Fridge', 'Inside Oven', 'Laundry & Folding - Per Load'].includes(addon.name) && (
                          <div className="quantity-control mt-2">
                            <Form.Control 
                              type="number" 
                              min="1" 
                              value={addonQuantities[addon.id] || 1}
                              size="sm"
                              onClick={(e) => e.stopPropagation()} 
                              onChange={(e) => updateAddonQuantity(addon.id, parseInt(e.target.value) || 1)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </section>
            {/* Personal Information Section */}
            <section className="form-section">
              <h3>WHO YOU ARE</h3>
              <p>This information will be used to contact you about your service.</p>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>First Name*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Last Name*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email*</Form.Label>
                    <Form.Control 
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Mobile Phone*</Form.Label>
                    <Form.Control 
                      type="tel"
                      value={personalInfo.mobile}
                      onChange={(e) => setPersonalInfo({...personalInfo, mobile: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mt-3">
                <Form.Check 
                  type="checkbox"
                  label="Send me reminders about my booking via text message"
                  checked={personalInfo.sendTextReminders}
                  onChange={(e) => setPersonalInfo({...personalInfo, sendTextReminders: e.target.checked})}
                />
              </Form.Group>
            </section>
            
            {/* Address Section */}
            <section className="form-section">
              <h3>YOUR HOME</h3>
              <p>Where should we set up to clean?</p>
              <Row>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Address*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Apt #</Form.Label>
                    <Form.Control 
                      type="text"
                      value={address.apt}
                      onChange={(e) => setAddress({...address, apt: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>City*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>State*</Form.Label>
                    <Form.Control 
                      as="select"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      required
                    >
                      <option value="">Select</option>
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="WI">WI</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Postal Code*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </section>
            
             {/* Date & Time Section */}
             <section className="form-section">
              <h3>CHOOSE SERVICE DATE & ARRIVAL TIME WINDOW</h3>
              <p>Our most popular window is the First Available option. Booking after 7pm will limit options for next day cleaners.</p>
              <p>NOTE: Arrival window represents time in which cleaners will arrive, not duration of cleaning.</p>
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Service Date*</Form.Label>
                    <DatePicker
                      selected={dateTime}
                      onChange={(date) => setDateTime(date)}
                      minDate={new Date()}
                      className="form-control"
                      placeholderText="Click to Choose a Date"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Time Window*</Form.Label>
                    <Form.Control 
                      as="select"
                      value={timeWindow}
                      onChange={(e) => setTimeWindow(e.target.value)}
                      required
                    >
                      <option value="">Select a time window</option>
                      <option value="8am - 10am">8am - 10am</option>
                      <option value="10am - 12pm">10am - 12pm</option>
                      <option value="12pm - 2pm">12pm - 2pm</option>
                      <option value="2pm - 4pm">2pm - 4pm</option>
                      <option value="4pm - 6pm">4pm - 6pm</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </section>
            
            {/* Additional Information Section */}
            <section className="form-section">
              <h3>ADDITIONAL INFORMATION</h3>
              <Form.Group>
                <Form.Label>On a scale of 1-5, what condition are things in?*</Form.Label>
                <Form.Control 
                  as="select"
                  value={additionalInfo.condition}
                  onChange={(e) => setAdditionalInfo({...additionalInfo, condition: e.target.value})}
                  required
                >
                  <option value="">Select</option>
                  <option value="1">1 - Needs deep cleaning</option>
                  <option value="2">2 - Below average</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Above average</option>
                  <option value="5">5 - Mostly just needs maintenance</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mt-3">
                <Form.Label>Do you have a preferred cleaning team? (costs extra, subject to availability)</Form.Label>
                <Form.Control 
                  as="select"
                  value={additionalInfo.preferredTeam}
                  onChange={(e) => setAdditionalInfo({...additionalInfo, preferredTeam: e.target.value})}
                >
                  <option value="No preference">No preference</option>
                  <option value="Team A">Team A</option>
                  <option value="Team B">Team B</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mt-3">
                <Form.Label>Are your flexible with arrival time?*</Form.Label>
                <Form.Control 
                  as="select"
                  value={additionalInfo.flexible}
                  onChange={(e) => setAdditionalInfo({...additionalInfo, flexible: e.target.value})}
                  required
                >
                  <option value="Not flexible">Not flexible</option>
                  <option value="Flexible within 1 hour">Flexible within 1 hour</option>
                  <option value="Flexible within 2 hours">Flexible within 2 hours</option>
                  <option value="Very flexible">Very flexible</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mt-3">
                <Form.Label>How did you hear about us?*</Form.Label>
                <Form.Control 
                  as="select"
                  value={additionalInfo.referralSource}
                  onChange={(e) => setAdditionalInfo({...additionalInfo, referralSource: e.target.value})}
                  required
                >
                  <option value="">Select</option>
                  <option value="Google">Google</option>
                  <option value="Friend">Friend</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Other">Other</option>
                </Form.Control>
              </Form.Group>
            </section>
            
            {/* Access Instructions Section */}
            <section className="form-section">
              <h3>ACCESS INSTRUCTIONS</h3>
              <Form.Group>
                <Form.Label>How will we access the home?*</Form.Label>
                <Form.Control 
                  as="select"
                  value={access.method}
                  onChange={(e) => setAccess({...access, method: e.target.value})}
                  required
                >
                  <option value="Someone will be home">Someone will be home</option>
                  <option value="Doorman">Doorman</option>
                  <option value="Key in lockbox">Key in lockbox</option>
                  <option value="Smart lock">Smart lock</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mt-3">
                <Form.Label>Access Instructions</Form.Label>
                <Form.Control 
                  as="textarea"
                  rows={3}
                  value={access.instructions}
                  onChange={(e) => setAccess({...access, instructions: e.target.value})}
                  placeholder="Provide any specific access instructions here"
                />
              </Form.Group>
              
              <p className="mt-3">Note: We do not hold keys from customers due to unpredictability and security concerns. We recommend using a key lockbox as a secure and convenient way to give teams access to your keys.</p>
            </section>
            
            {/* Parking Section */}
            <section className="form-section">
              <h3>PARKING</h3>
              <p>Visitor parking inside the building? Park on driveway? Street parking? Please indicate instructions here.</p>
              <Form.Group>
                <Form.Control 
                  as="textarea"
                  rows={3}
                  value={parking.instructions}
                  onChange={(e) => setParkingInfo({...parking, instructions: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mt-3">
                <Form.Label>If parking at your residence is paid parking, please select the approximate costs. 100% of the parking cost goes to your cleaning team to reimburse them:</Form.Label>
                <Form.Control 
                  as="select"
                  value={parking.cost}
                  onChange={(e) => setParkingInfo({...parking, cost: e.target.value})}
                >
                  <option value="$0">$0</option>
                  <option value="$5">$5</option>
                  <option value="$10">$10</option>
                  <option value="$15">$15</option>
                  <option value="$20">$20</option>
                </Form.Control>
              </Form.Group>
            </section>
            
            {/* Special Instructions Section */}
            <section className="form-section">
              <h3>SPECIAL INSTRUCTIONS</h3>
              <Form.Group>
                <Form.Label>Is there anything else our cleaners should know? What is important to you? What would you like to accomplish with this cleaning? Also, note if your home has been cleaned professionally for the first time.</Form.Label>
                <Form.Control 
                  as="textarea"
                  rows={4}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </Form.Group>
            </section>
            
            {/* Tip Section */}
            <section className="form-section">
              <h3>TIP (never expected, always appreciated)</h3>
              <Form.Group>
                <Form.Control 
                  type="text"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="Please specify amount"
                />
              </Form.Group>
            </section>
            
            {/* Payment Section */}
            <section className="form-section">
              <h3>SELECT PAYMENT</h3>
              <p>Enter your credit card information below. Don't worry, you won't be charged until after service has been rendered and you will receive an email receipt instantly.</p>
              
              <Form.Group>
                <Form.Label>Card Number*</Form.Label>
                <Form.Control 
                  type="text"
                  value={payment.cardNumber}
                  onChange={(e) => setPayment({...payment, cardNumber: e.target.value})}
                  placeholder="Card number"
                  required
                />
              </Form.Group>
              
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Expiry Date*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={payment.expiryDate}
                      onChange={(e) => setPayment({...payment, expiryDate: e.target.value})}
                      placeholder="MM / YY"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>CVV*</Form.Label>
                    <Form.Control 
                      type="text"
                      value={payment.cvv}
                      onChange={(e) => setPayment({...payment, cvv: e.target.value})}
                      placeholder="CVV"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mt-3">
                <Form.Check 
                  type="checkbox"
                  label="I authorize No More Chores to charge my credit card above for agreed upon purchases. I understand that my information will be saved to file for further transactions on my account."
                  checked={true}
                  disabled
                />
              </Form.Group>
              
              <p className="mt-4">Our prices are based on certain assumptions on types of cleanliness and certain hours of labour, that vary for initial cleaning, Regular Recurring, Deep Cleans and Heavy Duty Cleans. We reserve the right to change the price of the clean if upon arrival it is clear that we are unable to complete the work in the allotted time we have estimated for your clean. You will be given the option to pay for extra time or provide us with guidance that you would like us to complete in the time we have allotted.</p>
              
              <Form.Group className="mt-3">
                <Form.Check 
                  type="checkbox"
                  label="I accept these terms and our Service Policies and Privacy Policy"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mt-4 book-now-btn"
                disabled={!termsAccepted}
              >
                BOOK NOW
              </Button>
            </section>
          </Form>
        </Col>
        
        {/* Booking Summary Card */}
        <Col md={4} >
          <Card className="booking-summary">
            <Card.Header>BOOKING SUMMARY</Card.Header>
            <Card.Body>
              <div className="summary-note">
                NOTE: Your Initial Cleaning will appear higher when Extras are selected. To see Recurring price, remove Extras from your selection
              </div>
              
              <div className="summary-item">
                <i className="fa fa-home"></i>
                <span>{bookingSummary.serviceType}</span>
              </div>
              
              <div className="summary-item">
                <i className="fa fa-calendar"></i>
                <span>{bookingSummary.serviceDate}</span> @ <span>{bookingSummary.timeWindow}</span>
              </div>
              
              <div className="summary-item">
                <i className="fa fa-refresh"></i>
                <span>{bookingSummary.frequency}</span>
              </div>
              
              <div className="summary-pricing">
                <div className="price-row">
                  <span>SUB-TOTAL</span>
                  <span>${bookingSummary.subTotal}</span>
                </div>
                <div className="price-row">
                  <span>DISCOUNT</span>
                  <span>${bookingSummary.discount}</span>
                </div>
                <div className="price-row">
                  <span>SALES TAX</span>
                  <span>${bookingSummary.salesTax}</span>
                </div>
                <div className="price-row">
                  <span>TIP</span>
                  <span>${bookingSummary.tip}</span>
                </div>
                <div className="price-row total">
                  <span>INITIAL CLEANING</span>
                  <span>${bookingSummary.initialCleaning}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm;