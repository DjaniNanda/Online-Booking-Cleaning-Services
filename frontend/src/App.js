import React from "react";
import Navbar from "./views/Navbar";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Footer from "./views/Footer";
import Homepage from './views/Homepage.js';
import BookingForm from "./views/BookingForm.js";
import ScrollToTop from './views/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
      <Route element={<Homepage/>} exact path="/"  />
      <Route element={<BookingForm/>} exact path="bookingform/" />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
