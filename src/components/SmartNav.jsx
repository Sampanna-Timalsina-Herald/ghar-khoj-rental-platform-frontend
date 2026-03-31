import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Key } from "lucide-react";
import gharkhojLogo from "../assets/GHARKHOJ_LOGO.png";

const SmartNav = () => {
  const [showNav, setShowNav] = useState(true); // Start visible
  const [isScrolled, setIsScrolled] = useState(false); // To change background
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 80) {
        setIsScrolled(true);
        if (currentScrollY > lastScrollY) {
          setShowNav(false);
        } else {
          setShowNav(true);
        }
      } else {
        setIsScrolled(false);
        setShowNav(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const navItemClass = (isTenant) => 
    `px-3 py-2 rounded-full font-medium transition ${
      isTenant ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-600 hover:text-blue-600'
    }`;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 transform 
      ${isScrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'}
      ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <img src={gharkhojLogo} alt="Gharkhoj" className="h-16 w-auto object-contain" />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <Link to="/search" className={navItemClass(true)}><User size={18} className="inline-block mr-1"/> Tenant: Find Home</Link>
          <Link to="/list-property" className={navItemClass(false)}><Key size={18} className="inline-block mr-1"/> Landlord: List Property</Link>
          <Link to="/about" className={navItemClass(false)}>About Us</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 rounded-full font-medium text-gray-600 hover:text-blue-600 transition">Login</Link>
          <Link to="/register" className="px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-full font-bold hover:bg-yellow-500 transition shadow-md">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default SmartNav;