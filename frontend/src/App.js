import React from "react";
import Navbar from "./views/Navbar";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Footer from "./views/Footer";
import Homepage from './views/Homepage.js';
import BookingForm from "./views/BookingForm.js";
import { Container } from "react-bootstrap";
import ScrollToTop from './views/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar /><Container>
      <Routes>
      <Route element={<Homepage/>} exact path="/"  />
      <Route element={<BookingForm/>} exact path="bookingform/" />
      </Routes>
      </Container><Footer/>
    </Router>
  );
}

export default App;
