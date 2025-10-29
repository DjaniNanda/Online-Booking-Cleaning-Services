import React from "react";
import Navbar from "./views/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Footer from "./views/Footer";
import Homepage from './views/Homepage.js';
import BookingForm from "./views/BookingForm.js";
import ScrollToTop from './views/ScrollToTop';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bookingform" element={<Elements stripe={stripePromise}> <BookingForm /> </Elements>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
