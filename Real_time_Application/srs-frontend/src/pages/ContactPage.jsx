import React from 'react';
import Navbar from '../components/Navbar';
import ContactUs from '../components/ContactUs';
import Footer from '../components/Footer';

const ContactPage = () => {
  return (
    <>
      <Navbar cartCount={0} />
      <ContactUs />
      <Footer />
    </>
  );
};

export default ContactPage;
