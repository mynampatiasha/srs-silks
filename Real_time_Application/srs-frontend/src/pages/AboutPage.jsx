import React from 'react';
import Navbar from '../components/Navbar';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <>
      <Navbar cartCount={0} />
      <AboutUs />
      <Footer />
    </>
  );
};

export default AboutPage;
