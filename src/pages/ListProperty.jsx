import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Shield, Users, Zap, CheckCircle, Key, UploadCloud, MapPin, TrendingUp } from 'lucide-react';
import SmartNav from "../components/SmartNav";

// Helper component for the feature cards
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-400/80 flex flex-col items-start hover:shadow-xl transition-shadow duration-300"
  >
    <div className="p-3 bg-yellow-100 rounded-full mb-4">
      <Icon size={32} className="text-yellow-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const ListProperty = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans">
      <SmartNav />

      {/* 1. Modern Hero Section with Light Color Scheme */}
      <div className="pt-40 pb-20 relative overflow-hidden bg-blue-50">
        
        {/* Subtle Background Pattern/Image Placeholder - Lightened further */}
        {/* Using a subtle, light image overlay for texture */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1500&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

        {/* Content Wrapper */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto px-6 relative z-10 grid md:grid-cols-2 items-center gap-10"
        >
          <div>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-gray-900">
                    List Your Property, <span className="text-blue-600">Find Verified Tenants.</span>
                </h1>
                <p className="text-xl opacity-90 max-w-lg mb-6 text-gray-700">
                    Gharkhoj is Kathmandu Valley’s most reliable platform for connecting landlords with quality tenants, fast. We handle the hustle, you enjoy the returns.
                </p>
                <Link
                    to="/register?role=landlord"
                    className="inline-flex items-center px-8 py-3 bg-yellow-400 text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/50"
                >
                    Start Listing Today
                </Link>
            </div>
            
            {/* Secondary Visual Element (Icon Focus) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden md:flex justify-center items-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100"
            >
                <div className="grid grid-cols-2 gap-8">
                    <Zap size={64} className="text-blue-600 p-3 bg-blue-100 rounded-xl shadow-md"/>
                    <Shield size={64} className="text-blue-600 p-3 bg-blue-100 rounded-xl shadow-md"/>
                    <Users size={64} className="text-blue-600 p-3 bg-blue-100 rounded-xl shadow-md"/>
                    <TrendingUp size={64} className="text-blue-600 p-3 bg-blue-100 rounded-xl shadow-md"/>
                </div>
            </motion.div>
        </motion.div>
        
        {/* Simple bottom wave visual break - adjusted for light background */}
        <svg className="absolute bottom-0 left-0 w-full h-auto text-gray-50" viewBox="0 0 1440 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50C240 10 480 10 720 50C960 90 1200 90 1440 50V100H0V50Z" />
        </svg>

      </div>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto -mt-12 px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Users}
            title="Access Verified Tenants"
            description="We pre-screen users to ensure you only deal with serious and reliable tenants."
            delay={0.1}
          />
          <FeatureCard 
            icon={Zap}
            title="Rapid Listing & Visibility"
            description="Your property goes live instantly and is featured prominently to our large Kathmandu audience."
            delay={0.3}
          />
          <FeatureCard 
            icon={DollarSign}
            title="Maximized Rental Income"
            description="Get transparent market insights to help you set the optimal rent price for your area."
            delay={0.5}
          />
        </div>
      </section>

      {/* How It Works for Landlords */}
      <section className="max-w-6xl mx-auto mt-24 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-12">How Landlords Succeed with Gharkhoj</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[{title: "Create Account", icon: Key, desc: "Sign up as a Landlord easily."}, 
              {title: "Upload Details", icon: UploadCloud, desc: "Add photos, amenities, and rent amount."},
              {title: "Go Live", icon: CheckCircle, desc: "Your listing is verified and published."},
              {title: "Receive Enquiries", icon: Users, desc: "Connect directly with verified potential tenants."}
            ].map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md"
                >
                    <div className="text-4xl font-bold text-blue-600 mb-3">{index + 1}</div>
                    <step.icon size={36} className="text-blue-600 mb-3"/>
                    <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{step.desc}</p>
                </motion.div>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto mt-24 mb-20 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-yellow-400 p-10 rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to List Your Property?</h2>
          <p className="text-lg text-gray-800 mb-6">
            Join the community of landlords who trust Gharkhoj for easy and secure renting.
          </p>
          <Link
            to="/register?role=landlord" // Directs to registration page with 'landlord' pre-selected
            className="inline-flex items-center px-10 py-4 bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/50"
          >
            Register as a Landlord & List Now
          </Link>
        </motion.div>
      </section>
      
      {/* Footer (You can reuse the footer from Home.js) */}
      <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center">
        <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved. Built for Kathmandu Valley.</p>
      </footer>
    </div>
  );
};

export default ListProperty;