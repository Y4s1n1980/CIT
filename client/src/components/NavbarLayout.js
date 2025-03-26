import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CookieBanner from './CookieBanner';

const NavbarLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <CookieBanner />
    </>
  );
};

export default NavbarLayout;
