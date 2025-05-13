import React from "react";
import Navbar from "./views/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Footer from "./views/Footer";
import Homepage from './views/Homepage.js';
import BookingForm from "./views/BookingForm.js";
import ScrollToTop from './views/ScrollToTop';

// Initialize Stripe with your publishable key
// Replace with your actual publishable key from Stripe dashboard
// Since you're using a React project, use process.env.REACT_APP_ prefix instead of NEXT_PUBLIC_
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51QrleQQqAipzKUklfeY5FfeTWRXARESct5Csb3KBNkQW8xLzL2Fp8NmrhHqQMumQ8hwQoUuEqsO0KF1mmQHB5ST200VQx6CXdT");

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